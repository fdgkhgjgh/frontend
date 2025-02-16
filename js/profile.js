// frontend/js/profile.js
import { formatDate } from './utils.js';
import { API_BASE_URL } from './config.js'; //Import constant

const userInfo = document.getElementById('user-info');
const userPostsContainer = document.getElementById('user-posts');

async function loadUserProfile() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const profilePicture=document.getElementById('profile-picture');

    if (!userId || !token) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }

    try {
        //Fetch the user profile
        const response = await fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
       if (!response.ok) {
            const data = await response.json() //Get response message
            throw new Error(`Failed to fetch user profile: ${data.message}`);
        }
       const data = await response.json();

        //Display the username.
        userInfo.textContent = `Welcome, ${username}!`;

        profilePicture.src = data.profilePictureUrl || 'assets/default-profile.png';
        profilePicture.alt = `${username}'s Profile Picture`;

        // Fetch user's posts (we need a new backend endpoint for this)
        const postsResponse = await fetch(`${API_BASE_URL}/posts/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!postsResponse.ok) {
            const data = await postsResponse.json() //Get response message
            throw new Error(`Failed to fetch user posts: ${data.message}`);
        }

        const posts = await postsResponse.json();
        displayUserPosts(posts);

    } catch (error) {
        console.error("Error loading user profile:", error);
        document.getElementById('profile-info').innerHTML = `<p>Error: ${error.message}</p>`; // Display error message

        userPostsContainer.innerHTML = `<p>Error: ${error.message}</p>`; // Display error message
    }
}

async function updateProfile(event) {
    event.preventDefault(); // Prevent the default form submission
    const profileMessage = document.getElementById('profile-message');
    const profilePictureInput = document.getElementById('profilePicture');
    const profilePicture = profilePictureInput.files[0];
    const formData = new FormData();
    const userId = localStorage.getItem('userId');

    if (profilePicture) {
        formData.append('profilePicture', profilePicture);  // MUST MATCH BACKEND
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/auth/profile/update`, { // Correct Route
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        const data = await response.json();
        if (response.ok) {
            profileMessage.textContent = data.message;
            profileMessage.style.color = 'green';
            localStorage.setItem('profilePictureUrl', data.profilePictureUrl || null);
            loadUserProfile();
        } else {
            profileMessage.textContent = data.message;
            profileMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        profileMessage.textContent = 'An error occurred while updating the profile.';
        profileMessage.style.color = 'red';
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
    if (!isConfirm) return;

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

//notification clear
document.addEventListener('DOMContentLoaded', async () => {
    const responseContainer = document.getElementById('response-container');
    if (!responseContainer) {
        console.error("response-container element not found in profile.html");
        return; // Exit if the element doesn't exist
    }

    await fetchResponses(responseContainer); // Fetch new responses

    // Reset notifications on the backend
    await fetch(`${API_BASE_URL}/auth/reset-notifications`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    // Update the notification badge in the header. This is handled in app.js, so we'll just set the flag
    localStorage.setItem('notificationUpdateNeeded', 'true');
});

//shows responses
async function fetchResponses(responseContainer) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        responseContainer.innerHTML = ''; // Clear existing messages
        if (data.unreadNotifications > 0) {
            data.notifications.forEach(notification => {
                const notificationElement = document.createElement('p');
                if (notification.type === 'reply') {
                    notificationElement.innerHTML = `
                        You have a new reply on your comment: "${notification.commentText}"<br>
                        From: ${notification.replyAuthor}<br>
                        Reply: ${notification.replyText}<br><br>
                    `;
                } else if (notification.type === 'comment') {
                    notificationElement.innerHTML = `
                        You have a new comment on your post: "${notification.postTitle}"<br>
                        From: ${notification.commentAuthor}<br>
                        Comment: ${notification.commentText}<br><br>
                    `;
                }
                responseContainer.appendChild(notificationElement);
            });
        } else {
            responseContainer.innerHTML = "<p>No new responses.</p>";
        }
    } catch (error) {
        console.error("Error fetching responses:", error);
        responseContainer.innerHTML = "<p>Error loading responses.</p>";
    }
}

export { loadUserProfile, updateProfile }