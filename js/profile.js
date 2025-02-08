// frontend/js/profile.js
import { formatDate } from './utils.js';
import { API_BASE_URL } from './config.js'; //Import constant

const userInfo = document.getElementById('user-info');
const userPostsContainer = document.getElementById('user-posts');

async function loadUserProfile() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
     const username = localStorage.getItem('username');


    if (!userId || !token) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }

   try {
    //Display username.
     if (username) {
        userInfo.textContent = `Welcome, ${username}!`;
      }

    // Fetch user's posts (we need a new backend endpoint for this)
    const response = await fetch(`${API_BASE_URL}/posts/user/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

        if (!response.ok) {
             const data = await response.json() //Get response message
            throw new Error(`Failed to fetch user posts: ${data.message}`);
        }

         const posts = await response.json();
         displayUserPosts(posts);


   } catch(error) {
     console.error("Error loading user profile:", error);
     userPostsContainer.innerHTML = `<p>Error: ${error.message}</p>`; // Display error message
   }
}


function displayUserPosts(posts) {
    userPostsContainer.innerHTML = ''; // Clear existing posts

    if (posts.length === 0) {
        userPostsContainer.innerHTML = '<p>You have not created any posts yet.</p>';
        return;
    }

    posts.forEach(post => {
        // Create elements to display the post (similar to how you display posts on the main page)
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        const titleElement = document.createElement('h2');
        titleElement.textContent = post.title;
		postElement.appendChild(titleElement);

        const contentElement = document.createElement('p');
        contentElement.textContent = post.content.substring(0, 150);;
        postElement.appendChild(contentElement)

        const dateElement = document.createElement('p');
        dateElement.textContent = `Posted on: ${formatDate(post.createdAt)}`;
		postElement.appendChild(dateElement)
        // Add a Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            deletePost(post._id, postElement); // You'll reuse the deletePost function from app.js
        });
        postElement.appendChild(deleteButton);

        userPostsContainer.appendChild(postElement);

    });
}

// Reuse the deletePost function from app.js (you might want to move it to a separate utils.js file)
async function deletePost(postId, postElement) {
      const isConfirm = confirm("Are you sure you want to delete this post ?")
    if(!isConfirm) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json()

        if (response.ok) {
            // Remove the post element from the DOM
			alert(data.message)
            postElement.remove();  // Remove post from the profile view.
        } else {
          alert(`Error: ${data.message}`) //Show detail failed message.
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert("An error occurred while deleting post.")
    }
}

// No DOMContentLoaded here ,because we have add it in profile.html
//Export loadUserProfile ,if you want to use other place.
export {loadUserProfile}