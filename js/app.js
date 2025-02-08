// frontend/js/app.js
import { formatDate } from './utils.js';
import { checkLoginStatus } from './auth.js';
import { API_BASE_URL } from './config.js'; // Import the constant

const postList = document.getElementById('post-list');
const createPostFormMain = document.getElementById('create-post-form-main');
const createPostMessageMain = document.getElementById('create-post-message-main');
//const API_BASE_URL = 'https://backend-5be9.onrender.com/api'; // Moved to config.js

// ... (rest of your app.js code, including displayPosts, handleLike, handleDislike) ...
// Make sure handleLike and handleDislike use the imported API_BASE_URL

function displayPosts(posts) {
  postList.innerHTML = ''; // Clear existing posts

  posts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.classList.add('post');

      const contentContainer = document.createElement('div');
      contentContainer.classList.add('post-content');

      const titleElement = document.createElement('h2');
      const titleLink = document.createElement('a');
      titleLink.href = `post-details.html?id=${post._id}`;
      titleLink.textContent = post.title;
      titleElement.appendChild(titleLink);
      contentContainer.appendChild(titleElement);

      const authorDateElement = document.createElement('p');
      authorDateElement.textContent = `By: ${post.author.username} on ${formatDate(post.createdAt)}`;
      contentContainer.appendChild(authorDateElement);

      const contentElement = document.createElement('p');
      contentElement.textContent = post.content.substring(0, 250);
      contentContainer.appendChild(contentElement);

      // --- Like/Dislike Buttons ---
      const voteContainer = document.createElement('div');
      voteContainer.classList.add('vote-container');

      const likeButton = document.createElement('button');
      likeButton.classList.add('vote-button', 'like-button');
      likeButton.innerHTML = '&#x25B2;';
      likeButton.dataset.postId = post._id;  // Store post ID
      voteContainer.appendChild(likeButton);

      const likeCount = document.createElement('span');
      likeCount.classList.add('vote-count');
      likeCount.textContent = post.likes;  // Initial count
      voteContainer.appendChild(likeCount);

      const dislikeButton = document.createElement('button');
      dislikeButton.classList.add('vote-button', 'dislike-button');
      dislikeButton.innerHTML = '&#x25BC;';
      dislikeButton.dataset.postId = post._id; // Store post ID
      voteContainer.appendChild(dislikeButton);

      const dislikeCount = document.createElement('span');
      dislikeCount.classList.add('vote-count');
      dislikeCount.textContent = post.dislikes; // Initial count
      voteContainer.appendChild(dislikeCount);

      contentContainer.appendChild(voteContainer);

      if (post.imageUrl) {
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('image-container');
        const imgElement = document.createElement('img');
        imgElement.src = post.imageUrl;
        imgElement.alt = post.title;
        imgContainer.appendChild(imgElement);
        contentContainer.appendChild(imgContainer);
      }
        const currentUserId = localStorage.getItem('userId');
        if (currentUserId && currentUserId === post.author._id.toString()) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', () => {
                deletePost(post._id, postElement);
            });
            contentContainer.appendChild(deleteButton);
        }
        postElement.appendChild(contentContainer);
        postList.appendChild(postElement);


      // Attach event listeners *AFTER* elements are in the DOM
      likeButton.addEventListener('click', () => handleLike(post._id, likeCount));
      dislikeButton.addEventListener('click', () => handleDislike(post._id, dislikeCount));
  });
}


async function loadPosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`); // Use API_BASE_URL
        if (!response.ok) {
            throw new Error(`Failed to fetch posts: ${response.status}`);
        }
        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        postList.innerHTML = '<p>Error loading posts. Please try again later.</p>';
    }
}
// --- Like Handler ---
async function handleLike(postId, likeCountElement) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in to like.");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      likeCountElement.textContent = data.likes; // Update with server response
    } else {
      alert(`Error: ${data.message}`);
      console.error('Like failed:', data.message);
    }
  } catch (error) {
    console.error('Error liking post:', error);
    alert("An error occurred while liking the post.");
  }
}

// --- Dislike Handler ---
async function handleDislike(postId, dislikeCountElement) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("You must be logged in to dislike.");
            return
        }
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/dislike`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
           dislikeCountElement.textContent = data.dislikes
        } else {
          alert(`Error: ${data.message}`);
          console.error('Dislike failed:', data.message);
        }
    } catch (error) {
        console.error('Error disliking post:', error);
      alert("An error occurred while disliking post.")
    }
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
            const data = await response.json();

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
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    updateHeader();
    loadPosts();  // Moved INSIDE DOMContentLoaded
});