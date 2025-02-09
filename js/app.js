// frontend/js/app.js
import { formatDate } from './utils.js'; // Import the formatDate function
import { checkLoginStatus } from './auth.js'; // Import checkLoginStatus

const postList = document.getElementById('post-list');

// Create post element and relative variables.
const createPostFormMain = document.getElementById('create-post-form-main');
const createPostMessageMain = document.getElementById('create-post-message-main');
const API_BASE_URL = 'https://backend-5be9.onrender.com/api'; //  Or your Render backend URL


async function loadPosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`); // Use API_BASE_URL
        console.log('Response:', response); // Log the entire response object

        if (!response.ok) {
            throw new Error(`Failed to fetch posts: ${response.status}`);
        }
        const posts = await response.json();
        console.log('Posts:', posts); // Log the parsed posts data
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        postList.innerHTML = '<p>Error loading posts. Please try again later.</p>';
    }
}

// function displayPosts.

function displayPosts(posts) {
    postList.innerHTML = ''; // Clear existing posts
    posts.forEach(post => {
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
        contentContainer.appendChild(titleElement);
       // titleElement.textContent = post.title; //No need this, we already add link text above.

        // ... (rest of the displayPosts function: author, content, image, etc.) ...

        // --- Author and Date ---
        const authorDateElement = document.createElement('p');
        authorDateElement.textContent = `By: ${post.author.username} on ${formatDate(post.createdAt)}`;
        contentContainer.appendChild(authorDateElement);

		// --- Content ---
		 const contentElement = document.createElement('p');
        contentElement.textContent = post.content.substring(0, 250); // Show a  preview
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

        // --- Image (Right Side) ---
        if (post.imageUrl) {
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('image-container');

            const imgElement = document.createElement('img');
            imgElement.src = post.imageUrl;
            imgElement.alt = post.title;
            //No need set width and height in js, just set in css.
            imgContainer.appendChild(imgElement);
          //  postElement.appendChild(imgContainer); // Append image container to the *main* post element
            contentContainer.appendChild(imgContainer)
        }
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

// Attach event listener to the post list (event delegation)
postList.addEventListener('click', async (event) => {
    if (event.target.classList.contains('vote-button')) {
        const postId = event.target.dataset.postId;
        const voteType = event.target.dataset.voteType;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You must be logged in to vote.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/posts/${postId}/${voteType}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json()
                throw new Error(`Voting failed: ${data.message}`);
            }

            const data = await response.json(); // Get updated counts

            // Update the vote counts on the page
            document.getElementById(`upvote-count-${postId}`).textContent = data.upvotes;
            document.getElementById(`downvote-count-${postId}`).textContent = data.downvotes;
        } catch (error) {
            console.error('Error voting:', error);
            alert(error.message);
        }
    }
});

// --- ADD COMMENT FUNCTION --- (Removed)

async function deletePost(postId, postElement) {
    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {  //Use API_BASE_URL
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

//Delete comment function. (Removed)

//Setup modal. (Removed)

// --- CREATE POST FUNCTION (in index.html) ---
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
            const response = await fetch(`${API_BASE_URL}/posts`, { //Use API_BASE_URL
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            console.log("Create Post Response:", response); // ADD THIS

            const data = await response.json();

            console.log("Create Post Data:", data);  //ADD THIS

            if (response.ok) {
                createPostMessageMain.textContent = 'Post created successfully!';
                createPostMessageMain.style.color = "green";
                //Reload posts to display the new post.
                loadPosts();
                //Clear the form
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
//Update header to show username.
function updateHeader() {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId'); // Get the logged-in user's ID
    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');

    if (username && userId) { // Check for both username *and* userId
         // User is logged in, Create link with username
        const usernameDisplay = document.createElement('span');
        usernameDisplay.id = 'user-info';

        const userLink = document.createElement('a'); // Create the link element
        userLink.href = `profile.html?id=${userId}`; // Set the link to profile.html with the user's ID
        userLink.textContent = username; // The username is the link text

        usernameDisplay.textContent = 'Logged in as: ';  //Text before link
        usernameDisplay.appendChild(userLink);           // Put link in the span.

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

        // Check if element exists before to appendChild.
        const navElement = document.querySelector('header nav');
        if (navElement) {
            navElement.appendChild(usernameDisplay);
        }
    } else {
        // User is not logged in, remove the username display if it exists
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
// Call checkLoginStatus and loadPosts, and updateHeader when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus(); // Now this will work correctly
    updateHeader(); // Update header to show username.
    loadPosts();
});
