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

function displayPosts(posts) {
  console.log("postList element", postList) //Check postList get correct.
    postList.innerHTML = ''; // Clear existing posts
    posts.forEach(post => {
        console.log('Current Post:', post); // Log each individual post
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        const titleElement = document.createElement('h2');
        titleElement.textContent = post.title;
        postElement.appendChild(titleElement);

        const authorElement = document.createElement('p');
        authorElement.textContent = `By: ${post.author.username}`; // Display the author's username
        postElement.appendChild(authorElement);

        const contentElement = document.createElement('p');
        contentElement.textContent = post.content.substring(0, 150); // Show a preview
        postElement.appendChild(contentElement);


        if (post.imageUrl) {
            const imgElement = document.createElement('img');
            imgElement.src = post.imageUrl;
            imgElement.alt = post.title;
            imgElement.style.maxWidth = '100%'; // Ensure images fit within the container
            imgElement.style.height = 'auto';
            postElement.appendChild(imgElement);
        }
		// Format and display the creation date
        const dateElement = document.createElement('p');
        dateElement.textContent = `Posted on: ${formatDate(post.createdAt)}`; // Use formatDate here
        postElement.appendChild(dateElement);

        //Add view details button to jump a new details page in the future.
        const detailsLink = document.createElement('a');
        detailsLink.href = '#';  // Replace this with the post detail page URL when created.
        detailsLink.textContent = 'View Details';
        postElement.appendChild(detailsLink);
        // Add click event in the future.

        // --- DELETE BUTTON LOGIC --- (Existing delete button logic)
        const currentUserId = localStorage.getItem('userId');
        if (currentUserId && currentUserId === post.author._id.toString()) {
            // Only show the delete button if the current user is the author
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-button'); // Add a class for styling
            deleteButton.addEventListener('click', () => {
                deletePost(post._id, postElement); // Pass the post ID *and* the element
            });
            postElement.appendChild(deleteButton);
        }

        // --- COMMENT SECTION --- (Removed)

        postList.appendChild(postElement);
    });
}

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
    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');

    if (username) {
         // User is logged in, display username and hide login/register links
        const usernameDisplay = document.createElement('span');
        usernameDisplay.textContent = `Logged in as: ${username}`;
        usernameDisplay.id = 'user-info';
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

        document.querySelector('header nav').appendChild(usernameDisplay); //Append after <nav>
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