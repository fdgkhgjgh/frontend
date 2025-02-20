// frontend/js/profile.js
import { formatDate } from './utils.js';
import { API_BASE_URL } from './config.js'; //Import constant

const userInfo = document.getElementById('user-info');
const userPostsContainer = document.getElementById('user-posts');
const responseContainer = document.getElementById('response-container'); // Get the response container -VERY IMPORTANT.
const updateProfileForm = document.getElementById('update-profile-form'); // Get the form

// Get references to the button and icons
const updateProfileButton = updateProfileForm.querySelector('button[type="submit"]'); //VERY important
const buttonSpinner = document.getElementById('button-spinner');
const buttonSuccessIcon = document.getElementById('button-success-icon');

async function loadUserProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('id');  // Get userId from URL

    const loggedInUserId = localStorage.getItem('userId'); // Get logged-in user ID
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const profilePicture = document.getElementById('profile-picture');

    let userIdToFetch;
    let isOwnProfile = false;  // ADDED: Flag to track if it's the logged-in user's profile

    if (profileId) {
        userIdToFetch = profileId; // Use userId from URL if present
        isOwnProfile = (profileId === loggedInUserId); //Check if current viewing profile belong to login user.
    } else if (loggedInUserId) {
        userIdToFetch = loggedInUserId; // Otherwise, use logged-in user ID
        isOwnProfile = true;  //Viewing loggin user profile so,is true.
    } else {
        window.location.href = 'login.html';
        return;
    }

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        //Fetch the user profile
        const response = await fetch(`${API_BASE_URL}/auth/profile/${userIdToFetch}`, {
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
        userInfo.textContent = `Welcome, ${data.username}!`;

        profilePicture.src = data.profilePictureUrl || 'assets/default-profile.png';
        profilePicture.alt = `${data.username}'s Profile Picture`;

        const postsResponse = await fetch(`${API_BASE_URL}/posts/user/${userIdToFetch}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!postsResponse.ok) {
            const data = await postsResponse.json() //Get response message
            throw new Error(`Failed to fetch user posts: ${data.message}`);
        }

        const posts = await postsResponse.json();
        displayUserPosts(posts, isOwnProfile);  //***Pass the Flag!***

    const updateProfileSection = document.getElementById('update-profile-form');
    if (updateProfileSection) {
        updateProfileSection.style.display = isOwnProfile ? 'block' : 'none';
    }

    } catch (error) {
        console.error("Error loading user profile:", error);
        document.getElementById('profile-info').innerHTML = `<p>Error: ${error.message}</p>`;

        userPostsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

async function updateProfile(event) {
    event.preventDefault();
    const profileMessage = document.getElementById('profile-message');

    const profilePictureInput = document.getElementById('profilePicture');
    const profilePicture = profilePictureInput.files[0];

    const formData = new FormData();
    const userId = localStorage.getItem('userId'); //Always update your own profile here!!

    if (profilePicture) {
        formData.append('profilePicture', profilePicture);  // MUST MATCH BACKEND
    }

     //--- SET BUTTON TO "SENDING" STATE ---
    setButtonState('sending');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/auth/profile/update`, { // Correct Route
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            profileMessage.textContent = data.message;
            profileMessage.style.color = 'green';

            // Update the profile picture in local storage
            localStorage.setItem('profilePictureUrl', data.profilePictureUrl || null);

            // Reload the profile information to display the updated picture
            loadUserProfile();

            // Also update the image in the header (if it's displayed there)
            const headerProfilePicture = document.querySelector('header img.profile-picture'); // Adjust the selector if needed
            if (headerProfilePicture) {
                headerProfilePicture.src = data.profilePictureUrl || 'assets/default-profile.png'; // Ensure it's updated in the header, too
            }
               //--- SET BUTTON TO "SUCCESS" STATE ---
               setButtonState('success');
                setTimeout(() => {
                    setButtonState('default');
                }, 1500); // 1.5 seconds (adjust as needed)

        } else {
            profileMessage.textContent = data.message;
            profileMessage.style.color = 'red';
              //--- SET BUTTON TO "error" STATE ---
               setButtonState('error');
                setTimeout(() => {
                    setButtonState('default');
                }, 1500); // 1.5 seconds (adjust as needed)
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        profileMessage.textContent = 'An error occurred while updating the profile.';
        profileMessage.style.color = 'red';
          //--- SET BUTTON TO "error" STATE ---
               setButtonState('error');
                setTimeout(() => {
                    setButtonState('default');
                }, 1500); // 1.5 seconds (adjust as needed)
    }
}

//running circle button
function setButtonState(state) {
    switch (state) {
        case 'sending':
            updateProfileButton.disabled = true;
            updateProfileButton.textContent = 'Updating...';
            buttonSpinner.style.display = 'inline-block';
            buttonSuccessIcon.style.display = 'none';
            break;
        case 'success':
            updateProfileButton.textContent = 'Updated!';
            buttonSpinner.style.display = 'none';
            buttonSuccessIcon.style.display = 'inline-block';
            break;
        case 'error':
            updateProfileButton.textContent = 'Error!';
            buttonSpinner.style.display = 'none';
            buttonSuccessIcon.style.display = 'none';
            break;
        default: // 'default' or any other state
            updateProfileButton.disabled = false;
            updateProfileButton.textContent = 'Update Profile';
            buttonSpinner.style.display = 'none';
            buttonSuccessIcon.style.display = 'none';
            break;
    }
}


function displayUserPosts(posts, isOwnProfile) {  //***ADDED isOwnProfile as a Parameter!***
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

        // Only Add a Delete button only if it's the logged-in user's profile
        if (isOwnProfile) { // Add this Check!
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                deletePost(post._id, postElement); // You'll reuse the deletePost function from app.js
            });
            postElement.appendChild(deleteButton);
        }

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
    const token = localStorage.getItem('token');
    if (!token) return;

    const responseContainer = document.getElementById('response-container');
    if (!responseContainer) {
        console.error("response-container element not found in profile.html");
        return; // Exit if the element doesn't exist
    }


    // Reset notifications on the backend, unconditionally
    try {
        await fetch(`${API_BASE_URL}/auth/reset-notifications`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        // Update the notification badge in the header. This is handled in app.js, so we'll just set the flag
        localStorage.setItem('notificationUpdateNeeded', 'true');

        await fetchResponses(responseContainer); // Fetch new responses, after resetting
    } catch (error) {
        console.error("Error resetting notifications:", error);
    }
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
        //console.log("full data in fetchResponses():", data); // Check full data

        responseContainer.innerHTML = ''; // Clear existing messages
        //console.log("Response data from /auth/notifications:", data);

         if (data.message) {
            responseContainer.innerHTML = "<p>No new activity.</p>";
        }
        // Check if there's a message and display it
        if (data.notifications && data.notifications.length > 0) {
            data.notifications.forEach(notification => {

            //console.log("There was activity from this notif!");
            const messageElement = document.createElement('p');
            // Create a link to the post details page
            const linkElement = document.createElement('a');
            linkElement.href = `post-details.html?id=${notification.postId}`; // Use the postId
            linkElement.textContent = notification.message; // Set the message as the link text
            messageElement.appendChild(linkElement);  // Append the link to the paragraph
            responseContainer.appendChild(messageElement); // Append the paragraph to the container
             });
        }

    } catch (error) {
        console.error("Error fetching responses:", error);
        responseContainer.innerHTML = "<p>Error loading responses.</p>";
    }
}

export { loadUserProfile, updateProfile }