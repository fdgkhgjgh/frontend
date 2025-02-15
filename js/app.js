// frontend/js/app.js
import { formatDate } from './utils.js'; // Import the formatDate function
import { checkLoginStatus } from './auth.js'; // Import checkLoginStatus
import { getUnreadNotifications } from './notifications.js';
import { API_BASE_URL } from './config.js';


const postList = document.getElementById('post-list');
const paginationContainer = document.createElement('div'); // Create a container for pagination
paginationContainer.id = 'pagination-container';
postList.parentNode.insertBefore(paginationContainer, postList.nextSibling); //Insert after the postList
// Create post element and relative variables.
const createPostFormMain = document.getElementById('create-post-form-main');
const createPostMessageMain = document.getElementById('create-post-message-main');
const createPostButton = document.getElementById('create-post-button');  // Get the button element!
const buttonSpinner = document.getElementById('button-spinner');
const buttonSuccessIcon = document.getElementById('button-success-icon');
const API_BASE_URL = 'https://backend-5be9.onrender.com/api'; //  Or your Render backend URL

let currentPage = 1; // Track the current page

async function loadPosts(page = 1) {
    try {
        const limit = 8; // Number of posts per page
        const response = await fetch(`${API_BASE_URL}/posts?page=${page}&limit=${limit}`); // Use API_BASE_URL
        console.log('Response:', response); // Log the entire response object

        if (!response.ok) {
            throw new Error(`Failed to fetch posts: ${response.status}`);
        }
        const data = await response.json(); // Parse response as JSON
        const posts = data.posts; // Get the posts
        const totalPages = data.totalPages; // Get total pages
        console.log('Posts:', posts); // Log the parsed posts data
        console.log('totalPages:', totalPages); // Log the parsed posts data
        displayPosts(posts);
        displayPagination(totalPages, page); // Display pagination controls

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

        // --- Author and Date ---
        const authorDateElement = document.createElement('p');
        authorDateElement.textContent = `By: ${post.author.username} on ${formatDate(post.createdAt)}`;

        // --- Content ---
        const contentElement = document.createElement('p');
        if (post.content) {
            // Split content into lines
            const lines = post.content.split('\n');
            let firstLine = lines[0].trim(); // Get the first line and trim it

            // Limit each line to 45 characters
            const maxLineChars = 45;
            if (firstLine.length > maxLineChars) {
                firstLine = firstLine.substring(0, maxLineChars) + '...';
            } else if (post.content.length > firstLine.length) { // If there's more content
                firstLine += '...'; // Add ellipsis to suggest there's more
            }

            contentElement.textContent = firstLine;
        } else {
            contentElement.textContent = ''; // or some placeholder if content is empty
        }


        // --- New Container for Title and Files ---
        const titleFileContainer = document.createElement('div');
        titleFileContainer.classList.add('title-file-container');
        titleFileContainer.appendChild(titleElement);


        // --- Images (Right Side) ---
        //Modified this images showing here .
        if (post.imageUrls && post.imageUrls.length > 0) {   //Check if has images.
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('image-container');
            imgContainer.style.display = 'flex'; //Use flex display.
            imgContainer.style.flexDirection = 'column'; //Vertical align.
            imgContainer.style.alignItems = 'center';   //Center images.

            const firstImageUrl = post.imageUrls[0]; // Get the *first* image URL

            const imgElement = document.createElement('img');
            imgElement.src = firstImageUrl;
            imgElement.alt = post.title;
            imgElement.style.maxWidth = '100%'; //Don't overflow container
            imgElement.style.maxHeight = '150px';
            imgElement.style.marginBottom = '5px'; //Optional spacing.
            imgContainer.appendChild(imgElement);

            titleFileContainer.appendChild(imgContainer);
        }

        //Display videos
        if (post.videoUrls && post.videoUrls.length > 0) {
            const videoContainer = document.createElement('div');
            videoContainer.classList.add('video-container');
            videoContainer.style.display = 'flex';
            videoContainer.style.flexDirection = 'column';
            videoContainer.style.alignItems = 'center';

            post.videoUrls.forEach(videoUrl => {
                const videoElement = document.createElement('video');
                videoElement.src = videoUrl;
                videoElement.alt = post.title;
                videoElement.controls = true; //Enable video controls.
                videoElement.style.maxWidth = '100%';
                videoElement.style.maxHeight = '300px';
                videoElement.style.marginBottom = '5px';

                videoContainer.appendChild(videoElement);
            });
            titleFileContainer.appendChild(videoContainer)
        }
        contentContainer.appendChild(titleFileContainer)
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

        
        // ***ADD PIN/UNPIN BUTTON HERE***
        const currentUserId = localStorage.getItem('userId');
        if (currentUserId && post.author && post.author._id && currentUserId === post.author._id.toString()) {
            const pinButton = document.createElement('button');
            pinButton.textContent = post.pinned ? 'Unpin' : 'Pin';
            pinButton.classList.add('pin-button');
            pinButton.dataset.postId = post._id;
            pinButton.addEventListener('click', (event) => {
                pinUnpinPost(post._id, event.target); // Pass the post ID and the button element
            });
            contentContainer.appendChild(pinButton);
        }

        // --- Combine Everything ---
        postElement.appendChild(contentContainer);
        postList.appendChild(postElement);

    });  // <--- CLOSING CURLY BRACE for forEach LOOP
}
// Function to display pagination controls
function displayPagination(totalPages, currentPage) {
    paginationContainer.innerHTML = ''; // Clear existing pagination
    const maxButtons = 5; // Maximum number of page buttons to display

    // Calculate start and end page numbers to display
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    // Adjust start page if end page is too close to totalPages
    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    // Previous Page button
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
            loadPosts(currentPage - 1);
        });
        paginationContainer.appendChild(prevButton);
    }

    // Create page number buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            loadPosts(i);
        });

        if (i === currentPage) {
            pageButton.classList.add('active'); // Style the current page button
        }

        paginationContainer.appendChild(pageButton);
    }

    // Next Page button
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
            loadPosts(currentPage + 1);
        });
        paginationContainer.appendChild(nextButton);
    }
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
    // Get references to the button and icons
    const createPostButton = document.getElementById('create-post-button');
    const buttonSpinner = document.getElementById('button-spinner');
    const buttonSuccessIcon = document.getElementById('button-success-icon');

    createPostFormMain.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title-main').value;
        const content = document.getElementById('content-main').value;
        const fileInput = document.getElementById('file-main');
        const files = fileInput.files;

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);

        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        // Function to set button loading state.
        function setButtonState(state) {
            switch (state) {
                case 'sending':
                    createPostButton.disabled = true;
                    createPostButton.textContent = 'Sending...';
                    buttonSpinner.style.display = 'inline-block';
                    buttonSuccessIcon.style.display = 'none';
                    break;
                case 'success':
                    createPostButton.textContent = 'Sent!';
                    buttonSpinner.style.display = 'none';
                    buttonSuccessIcon.style.display = 'inline-block';
                    break;
                case 'error':
                    createPostButton.textContent = 'Error!';
                    buttonSpinner.style.display = 'none';
                    buttonSuccessIcon.style.display = 'none';
                    break;
                default: // 'default' or any other state
                    createPostButton.disabled = false;
                    createPostButton.textContent = 'Send New Post';
                    buttonSpinner.style.display = 'none';
                    buttonSuccessIcon.style.display = 'none';
                    break;
            }
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                createPostMessageMain.textContent = "You must be logged in to create a post.";
                createPostMessageMain.style.color = 'red';
                return;
            }

            //--- SET BUTTON TO "SENDING" STATE ---
            setButtonState('sending');

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

            if (response.status === 429) {
                createPostMessageMain.textContent = data.message || "Too many requests, please try again later.";
                createPostMessageMain.style.color = 'red';
                setButtonState('default'); // Reset on error
            } else if (response.ok) {
                createPostMessageMain.textContent = 'Post created successfully!';
                createPostMessageMain.style.color = "green";
                //--- SET BUTTON TO "SUCCESS" STATE ---
                setButtonState('success');

                loadPosts();
                createPostFormMain.reset();

                //--- RESET BUTTON AFTER A DELAY ---
                setTimeout(() => {
                    setButtonState('default');
                }, 1500); // 1.5 seconds (adjust as needed)
            } else {
                createPostMessageMain.textContent = data.message || "An error occurred.";
                createPostMessageMain.style.color = 'red';
                setButtonState('error'); // Reset on error
                setTimeout(() => {
                    setButtonState('default');
                }, 1500); // 1.5 seconds (adjust as needed)
            }

        } catch (error) {
            console.error("Create post error:", error);
            createPostMessageMain.textContent = "An error occurred while creating post.";
            createPostMessageMain.style.color = 'red';
            setButtonState('error'); // Reset on error
            setTimeout(() => {
                setButtonState('default');
            }, 1500); // 1.5 seconds (adjust as needed)
        }
    });
}
//Update header to show username.
async function updateHeader() {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId'); // Get the logged-in user's ID
    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');

    if (username && userId) { // Check for both username *and* userId
        // Fetch unread notifications count from backend
        let unreadCount = 0;
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await fetch(`${API_BASE_URL}/auth/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                unreadCount = data.unreadNotifications || 0;
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }

        // User is logged in, Create link with username
        const usernameDisplay = document.createElement('span');
        usernameDisplay.id = 'user-info';

        const userLink = document.createElement('a'); // Create the link element
        userLink.href = `profile.html?id=${userId}`; // Set the link to profile.html with the user's ID
        userLink.textContent = username; // The username is the link text

        usernameDisplay.textContent = 'Logged in as: ';  //Text before link
        usernameDisplay.appendChild(userLink);           // Put link in the span.

        // Create a red notification badge if unreadCount > 0
        if (unreadCount > 0) {
            const notificationBadge = document.createElement('span');
            notificationBadge.id = 'notification-badge';
            notificationBadge.textContent = unreadCount;
            notificationBadge.style.color = 'white';
            notificationBadge.style.backgroundColor = 'red';
            notificationBadge.style.borderRadius = '50%';
            notificationBadge.style.padding = '3px 6px';
            notificationBadge.style.marginLeft = '5px';
            notificationBadge.style.fontSize = '12px';
            notificationBadge.style.fontWeight = 'bold';
            notificationBadge.style.minWidth = '18px';
            notificationBadge.style.textAlign = 'center';

            userLink.appendChild(notificationBadge); // Attach badge to username
        }

        if (loginLink) {
            loginLink.style.display = 'none';
        }
        if (registerLink) {
            registerLink.style.display = 'none';
        }

        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.style.display = 'inline-block';
        }

        // Append username display to nav
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
        if (loginLink) {
            loginLink.style.display = 'inline-block';
        }
        if (registerLink) {
            registerLink.style.display = 'inline-block';
        }
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
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

// NEW: Listen for localStorage changes.
window.addEventListener('storage', (event) => {
    if (event.key === 'notificationUpdateNeeded' && event.newValue === 'true') {
        setTimeout(() => {
            updateHeader(); // Refresh the header.
            localStorage.removeItem('notificationUpdateNeeded'); // Clear the flag.
            document.getElementById('notification-badge')?.remove();  //Then remove it here.
        }, 0); // Small delay (0ms should be sufficient)
    }
});

async function pinUnpinPost(postId, buttonElement) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("You must be logged in to pin/unpin a post.");
            return;
        }

        const response = await fetch(`${API_BASE_URL}/posts/${postId}/pin`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            buttonElement.textContent = data.pinned ? 'Unpin' : 'Pin'; // Update button text
            loadPosts(); // Reload posts to reflect the change in order
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error('Error pinning/unpinning post:', error);
        alert("An error occurred while pinning/unpinning the post.");
    }
}

