// frontend/js/app.js
import { formatDate } from './utils.js';
import { checkLoginStatus } from './auth.js';

const postList = document.getElementById('post-list');
const createPostFormMain = document.getElementById('create-post-form-main');
const createPostMessageMain = document.getElementById('create-post-message-main');
const API_BASE_URL = 'https://backend-5be9.onrender.com/api';

const POSTS_PER_PAGE = 8;
let currentPage = 1;
let totalPages = 1;
let isLoading = false;

async function loadPosts() {
    isLoading = true;
    try {
        const response = await fetch(`${API_BASE_URL}/posts?page=${currentPage}`);
        console.log('Raw Response:', response);

        if (!response.ok) {
            throw new Error(`Failed to fetch posts: ${response.status}`);
        }

        const data = await response.json();
        console.log('Parsed Data:', data);

        //Check if `data` is undefined and if its post is undefined.
        let posts = data && data.posts;
        if (!posts) {
             console.error("Posts data is missing or invalid:", data);
             posts = [];   // Set a default empty list to not throw posts is not defined error.
             //postList.innerHTML = '<p>Error loading posts. Data was incorrect.</p>';
            }

        totalPages = data ? data.totalPages : 1;  // Set totalPages a proper value

        console.log('Extracted Posts:', posts);

        displayPosts(posts);
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

   if (!posts || !Array.isArray(posts)) {
        console.warn("displayPosts was called with non-array:", posts);
        postList.innerHTML = "<p>No posts to display (likely a data issue).</p>";
        return;
    }
    posts.forEach(post => { //Ensure not to fail.
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // --- Main Container for Content ---
        const contentContainer = document.createElement('div');
        contentContainer.classList.add('post-content');

        // --- Title (NOW CLICKABLE) ---
        const titleElement = document.createElement('h2');
        const titleLink = document.createElement('a');
        titleLink.href = `post-details.html?id=${post._id}`;
        titleLink.textContent = post.title;
        titleElement.appendChild(titleLink);

        // --- Author and Date ---
        const authorDateElement = document.createElement('p');
        authorDateElement.textContent = `By: ${post.author.username} on ${formatDate(post.createdAt)}`;

        // --- Content ---
         const contentElement = document.createElement('p');
        contentElement.textContent = post.content.substring(0, 250);

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

        // const likeButton = document.createElement('button');
        // likeButton.classList.add('vote-button', 'like-button');
        // likeButton.innerHTML = '&#x25B2;';
        // likeButton.dataset.postId = post._id;
        // likeButton.dataset.voteType = "upvote"
        // voteContainer.appendChild(likeButton);

        //  //Upvotes span tag.
        // const upvoteCount = document.createElement('span');
        // upvoteCount.classList.add('vote-count');
        // upvoteCount.id = `upvote-count-${post._id}`;
        // upvoteCount.textContent = post.upvotes;
        // voteContainer.appendChild(upvoteCount);

        // const dislikeButton = document.createElement('button');
        // dislikeButton.classList.add('vote-button', 'dislike-button');
        // dislikeButton.innerHTML = '&#x25BC;';
        // dislikeButton.dataset.postId = post._id;
        // dislikeButton.dataset.voteType = "downvote"
        // voteContainer.appendChild(dislikeButton);

        //  //Downvotes span tag.
        // const downvoteCount = document.createElement('span');
        // downvoteCount.classList.add('vote-count');
        // downvoteCount.id = `downvote-count-${post._id}`;
        // downvoteCount.textContent = post.downvotes;
        // voteContainer.appendChild(downvoteCount);

        contentContainer.appendChild(voteContainer);

        // --- Delete Button---
         const currentUserId = localStorage.getItem('userId');
        if (currentUserId && currentUserId === post.author._id.toString()) {
            // Only show the delete button if the current user is the author
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', () => {
                deletePost(post._id, postElement);
            });
            contentContainer.appendChild(deleteButton);
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
                return;
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

// ADD a Force load
function domLoadedCallback() {
   if (document.readyState === "complete") {
      //ADD RAW DOM CHECK
      const postListCheck = document.getElementById('post-list');
      const paginationContainerCheck = document.getElementById('pagination-container');
      if (postListCheck && paginationContainerCheck) {
         console.log("DOM elements found");
         checkLoginStatus();
         updateHeader();
         loadPosts();
      } else {
         console.warn("post-list or pagination-container NOT FOUND.");
      }
   } else {
      console.log("Document not yet complete. State: " + document.readyState);
   }
}

document.addEventListener('DOMContentLoaded', domLoadedCallback);