// frontend/js/app.js
import { formatDate } from './utils.js';
import { checkLoginStatus } from './auth.js';

const postList = document.getElementById('post-list');
const createPostFormMain = document.getElementById('create-post-form-main');
const createPostMessageMain = document.getElementById('create-post-message-main');
const API_BASE_URL = 'https://backend-5be9.onrender.com/api';

const POSTS_PER_PAGE = 8; // Adjust as needed
let currentPage = 1;
let totalPages = 1;
let isLoading = false;

async function loadPosts() {
    isLoading = true;
    try {
        const response = await fetch(`${API_BASE_URL}/posts?page=${currentPage}`);
        console.log('Raw Response:', response); // Log the raw response

        if (!response.ok) {
            throw new Error(`Failed to fetch posts: ${response.status}`);
        }

        const data = await response.json(); // Parse the JSON response
        console.log('Parsed Data:', data);     // Log the parsed data

        const posts = data.posts;   // Extract the actual array of posts
        totalPages = data.totalPages;  // Extract total pages

        console.log('Extracted Posts:', posts);

        displayPosts(posts); // Pass the extracted posts array
        updatePaginationButtons();

    } catch (error) {
        console.error('Error loading posts:', error);
        postList.innerHTML = '<p>Error loading posts. Please try again later.</p>';
    } finally {
        isLoading = false;
    }
}

function displayPosts(posts) {
    postList.innerHTML = ''; // Clear existing posts
    //Use optional chaining in case posts is somehow null.
    posts?.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // --- Main Container for Content ---
        const contentContainer = document.createElement('div');
        contentContainer.classList.add('post-content');

        // --- Title (NOW CLICKABLE) ---
        const titleElement = document.createElement('h2');
        const titleLink = document.createElement('a'); // Create an <a> tag
        titleLink.href = `post-details.html?id=${post._id}`; // Set the link to the details page
        titleLink.textContent = post.title; // Set the link text to the post title
        titleElement.appendChild(titleLink);   // Wrap the title text in the link

        // --- Author and Date ---
        const authorDateElement = document.createElement('p');
        authorDateElement.textContent = `By: ${post.author.username} on ${formatDate(post.createdAt)}`;

        // --- Content ---
         const contentElement = document.createElement('p');
        contentElement.textContent = post.content.substring(0, 250); // Show a preview

        // --- New Container for Title and Image ---
        const titleImageContainer = document.createElement('div');
        titleImageContainer.classList.add('title-image-container');
        titleImageContainer.appendChild(titleElement);

         // --- Image (Right Side) ---
        if (post.imageUrl) {
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('image-container');

            const imgElement = document.createElement('img');
            imgElement.src = post.imageUrl;
            imgElement.alt = post.title;
            imgContainer.appendChild(imgElement);
            titleImageContainer.appendChild(imgContainer)
        }
        contentContainer.appendChild(titleImageContainer)
        contentContainer.appendChild(authorDateElement);
        contentContainer.appendChild(contentElement);

        // --- Like/Dislike Buttons ---
        const voteContainer = document.createElement('div');
        voteContainer.classList.add('vote-container');

        const likeButton = document.createElement('button');
        likeButton.classList.add('vote-button', 'like-button');
        likeButton.innerHTML = '&#x25B2;'; // Up arrow (▲) -  Use HTML entities for special characters
        likeButton.dataset.postId = post._id; //Set id for like button.
        likeButton.dataset.voteType = "upvote" //Set vote type for like button.
        voteContainer.appendChild(likeButton);

         //Upvotes span tag.
        const upvoteCount = document.createElement('span');
        upvoteCount.classList.add('vote-count');
        upvoteCount.id = `upvote-count-${post._id}`;
        upvoteCount.textContent = post.upvotes; //Set default upvotes.
        voteContainer.appendChild(upvoteCount);

        const dislikeButton = document.createElement('button');
        dislikeButton.classList.add('vote-button', 'dislike-button');
        dislikeButton.innerHTML = '&#x25BC;'; // Down arrow (▼)
        dislikeButton.dataset.postId = post._id; //Set id for dislike button.
        dislikeButton.dataset.voteType = "downvote" //Set vote type for dislike button.
        voteContainer.appendChild(dislikeButton);

         //Downvotes span tag.
        const downvoteCount = document.createElement('span');
        downvoteCount.classList.add('vote-count');
        downvoteCount.id = `downvote-count-${post._id}`;
        downvoteCount.textContent = post.downvotes; //Set default downvotes.
        voteContainer.appendChild(downvoteCount);

        contentContainer.appendChild(voteContainer);

        // --- Delete Button---
         const currentUserId = localStorage.getItem('userId');
        if (currentUserId && currentUserId === post.author._id.toString()) {
            // Only show the delete button if the current user is the author
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-button'); // Add a class for styling
            deleteButton.addEventListener('click', () => {
                deletePost(post._id, postElement); // Pass the post ID *and* the element
            });
            contentContainer.appendChild(deleteButton); // Append to content container.
        }

        // --- Combine Everything ---
        postElement.appendChild(contentContainer);
        postList.appendChild(postElement);
    });
}

async function deletePost(postId, postElement) {
    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        const data = await response.json();

        if (response.ok) {
            // Remove the post element from the DOM
            postElement.remove();
        } else {
			alert(`Error message:${data.message}`)
        }
    } catch (error) {
        console.error('Error deleting post:', error);
		alert("An error occurred while deleting the post.")
    }
}

if (createPostFormMain) {
    createPostFormMain.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title-main').value;
        const content = document.getElementById('content-main').value;
        const image = document.getElementById('image-main').files[0];

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if(image) {
            formData.append('image', image)
        }

        try{
            const token = localStorage.getItem('token');
            if (!token) {
                createPostMessageMain.textContent = "You must be logged in to create a post."
                createPostMessageMain.style.color = 'red';
                return; //Stop execution if not logged in.
            }
            const response = await fetch(`${API_BASE_URL}/posts`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            console.log("Create Post Response:", response);
            const data = await response.json();
            console.log("Create Post Data:", data);

            if (response.ok) {
                createPostMessageMain.textContent = 'Post created successfully!';
                createPostMessageMain.style.color = "green";
                loadPosts();
                createPostFormMain.reset();
            } else {
                createPostMessageMain.textContent = data.message;
                createPostMessageMain.style.color = 'red'
            }

        } catch(error) {
            console.error("Create post error:", error);
            createPostMessageMain.textContent = "An error occurred while creating post."
            createPostMessageMain.style.color = 'red';
        }
    })
}

function updateHeader() {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');

    if (username && userId) {
        const usernameDisplay = document.createElement('span');
        usernameDisplay.id = 'user-info';

        const userLink = document.createElement('a');
        userLink.href = `profile.html?id=${userId}`;
        userLink.textContent = username;

        usernameDisplay.textContent = 'Logged in as: ';
        usernameDisplay.appendChild(userLink);

        if(loginLink) {
            loginLink.style.display = 'none';
        }
        if(registerLink) {
            registerLink.style.display = 'none';
        }

        const logoutButton = document.getElementById('logout-button');
        if(logoutButton) {
            logoutButton.style.display = 'inline-block';
        }

        const navElement = document.querySelector('header nav');
        if (navElement) {
            navElement.appendChild(usernameDisplay);
        }
    } else {
        const usernameDisplay = document.getElementById('user-info');
        if (usernameDisplay) {
            usernameDisplay.remove();
        }
        if(loginLink) {
            loginLink.style.display = 'inline-block'
         }
        if(registerLink){
           registerLink.style.display = 'inline-block'
        }
        const logoutButton = document.getElementById('logout-button');
        if(logoutButton) {
            logoutButton.style.display = 'none';
        }
    }
}

function updatePaginationButtons() {
    let paginationHTML = '';

    // Previous Button
    paginationHTML += `<button id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;

    // Page Number Display
    paginationHTML += `<span> Page ${currentPage} of ${totalPages} </span>`;

    // Next Button
    paginationHTML += `<button id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;

    // Inject into the DOM - Assuming you have a pagination container
    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) {
        paginationContainer.innerHTML = paginationHTML;

        // Add event listeners to the buttons
        document.getElementById('prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadPosts();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadPosts();
            }
        });
    } else {
        console.warn('Pagination container not found!');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    updateHeader();
    let paginationHTML = `<div id = "pagination-container"></div>`;
    // After DOM is loaded, add a div to handle pagination, right after postList
    const paginationContainer = document.getElementById('post-list').insertAdjacentHTML("afterend", paginationHTML);
    loadPosts();
});