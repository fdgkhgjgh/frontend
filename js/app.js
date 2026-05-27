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

let currentPage = 1; // Track the current page

//search posts
let isSearching = false;
let currentSearchQuery = '';

async function searchPosts(page = 1) {
    const query = document.getElementById('search-input').value.trim();
    if (!query) {
        clearSearch();
        return;
    }

    isSearching = true;
    currentSearchQuery = query;
    document.getElementById('clear-search-btn').style.display = 'inline-block';

    try {
        const limit = 5;
        const response = await fetch(`${API_BASE_URL}/posts/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        displayPosts(data.posts);
        displayPagination(data.totalPages, page);

        if (data.posts.length === 0) {
            postList.innerHTML = '<p style="padding:10px;">No posts found.</p>';
        }
    } catch (error) {
        console.error('Search error:', error);
    }
}

function clearSearch() {
    isSearching = false;
    currentSearchQuery = '';
    document.getElementById('search-input').value = '';
    document.getElementById('clear-search-btn').style.display = 'none';
    loadPosts(1);
}

async function loadPosts(page = 1) {
    try {
        const limit = 5; // Number of posts per page
        const response = await fetch(`${API_BASE_URL}/posts?page=${page}&limit=${limit}`); // Use API_BASE_URL
        //console.log('Response:', response); // Log the entire response object

        if (!response.ok) {
            throw new Error(`Failed to fetch posts: ${response.status}`);
        }
        const data = await response.json(); // Parse response as JSON
        const posts = data.posts; // Get the posts
        const totalPages = data.totalPages; // Get total pages
        //console.log('Posts:', posts); // Log the parsed posts data
        //console.log('totalPages:', totalPages); // Log the parsed posts data
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
        postElement.style.cssText = `
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
			cursor: pointer;
        `; // ✅ closing backtick and semicolon was missing
		// ✅ Click anywhere on post to open it
postElement.addEventListener('click', () => {
    window.location.href = `post-details.html?id=${post._id}`;
});

        // --- Main Container for Content ---
        const textInfoContainer = document.createElement('div');
        textInfoContainer.classList.add('text-info-container');
        textInfoContainer.style.cssText = `
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
        `;

        const titleElement = document.createElement('h2');
        titleElement.style.margin = '0 0 4px 0';
        titleElement.style.fontSize = '0.95rem';

        const titleLink = document.createElement('a');
        titleLink.href = `post-details.html?id=${post._id}`;
        titleLink.textContent = post.title;

        const commentCountSpan = document.createElement('span');
        commentCountSpan.textContent = ` ( ${post.totalComments})`;
        commentCountSpan.style.fontWeight = 'normal';
        titleLink.appendChild(commentCountSpan);
        titleElement.appendChild(titleLink);

        const authorDateElement = document.createElement('p');
        authorDateElement.textContent = `By: ${post.author.username} on ${formatDate(post.createdAt)}`;
        authorDateElement.style.cssText = 'margin: 0; font-size: 0.8rem; color: #666;';

        textInfoContainer.appendChild(titleElement);
        textInfoContainer.appendChild(authorDateElement);

        // Pin button
        const currentUserId = localStorage.getItem('userId');
        if (currentUserId && post.author && post.author._id && currentUserId === post.author._id.toString()) {
            const pinButton = document.createElement('button');
            pinButton.textContent = post.pinned ? 'Unpin' : 'Pin';
            pinButton.classList.add('pin-button');
            pinButton.dataset.postId = post._id;
            pinButton.addEventListener('click', (event) => {
    event.stopPropagation(); // ✅ prevent opening post detail page
    pinUnpinPost(post._id, event.target);
});
            textInfoContainer.appendChild(pinButton);
        }

        // --- Right: image/video thumbnail ---
        let mediaElement = null;
        if (post.imageUrls && post.imageUrls.length > 0) {
            mediaElement = document.createElement('img');
            mediaElement.src = post.imageUrls[0];
            mediaElement.alt = post.title;
            mediaElement.classList.add('post-list-image');
        } else if (post.videoUrls && post.videoUrls.length > 0) {
            mediaElement = document.createElement('img');
            mediaElement.src = post.videoUrls[0]
                .replace('/upload/', '/upload/so_0/')
                .replace(/\.(mp4|mov|avi|webm)$/i, '.jpg');
            mediaElement.alt = post.title;
            mediaElement.classList.add('post-list-image');
        }

        // --- Combine: text left, image right ---
        postElement.appendChild(textInfoContainer);
        if (mediaElement) {
            postElement.appendChild(mediaElement);
        }
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
        prevButton.textContent = '上一页';
        prevButton.addEventListener('click', () => {
    if (isSearching) searchPosts(currentPage - 1);
    else loadPosts(currentPage - 1);
});
        paginationContainer.appendChild(prevButton);
    }

    // Create page number buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
    if (isSearching) searchPosts(i);
    else loadPosts(i);
});

        if (i === currentPage) {
            pageButton.classList.add('active'); // Style the current page button
        }

        paginationContainer.appendChild(pageButton);
    }

    // Next Page button
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = '下一页';
        nextButton.addEventListener('click', () => {
    if (isSearching) searchPosts(currentPage + 1);
    else loadPosts(currentPage + 1);
});
        paginationContainer.appendChild(nextButton);
		// Page jump input
    const jumpContainer = document.createElement('span');
    jumpContainer.style.cssText = 'margin-left: 8px; font-size: 0.85rem;';

    const jumpInput = document.createElement('input');
    jumpInput.type = 'number';
    jumpInput.min = 1;
    jumpInput.max = totalPages;
    jumpInput.placeholder = '跳到';
    jumpInput.style.cssText = `
        width: 55px;
        padding: 3px 6px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.85rem;
        text-align: center;
    `;

    jumpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const page = parseInt(jumpInput.value);
            if (page >= 1 && page <= totalPages) {
                loadPosts(page);
            }
        }
    });

    const jumpBtn = document.createElement('button');
    jumpBtn.textContent = '跳页';
    jumpBtn.style.cssText = `
        margin-left: 4px;
        padding: 3px 8px;
        font-size: 0.85rem;
        border-radius: 6px;
        cursor: pointer;
    `;
    jumpBtn.addEventListener('click', () => {
        const page = parseInt(jumpInput.value);
        if (page >= 1 && page <= totalPages) {
            loadPosts(page);
        }
    });

    jumpContainer.appendChild(jumpInput);
    jumpContainer.appendChild(jumpBtn);
    paginationContainer.appendChild(jumpContainer);
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
			window.location.href = 'profile.html';
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
                    createPostButton.textContent = '发送中Sending...';
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
                createPostMessageMain.textContent = "您必须登录后才能发送帖子You must be logged in to create a post.";
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

            //console.log("Create Post Response:", response);

            const data = await response.json();

            //console.log("Create Post Data:", data);

            if (response.status === 429) {
                createPostMessageMain.textContent = data.message || "Too many requests, please try again later.";
                createPostMessageMain.style.color = 'red';
                setButtonState('default'); // Reset on error
            } else if (response.ok) {
                createPostMessageMain.textContent = 'Post created successfully!';
				document.getElementById('create-post-modal').style.display = 'none';
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
        //console.log("Detected notification update needed. Refreshing header."); // ADDED LOG
        setTimeout(() => {
            updateHeader(); // Refresh the header.
            localStorage.removeItem('notificationUpdateNeeded'); // Clear the flag.
            const badge = document.getElementById('notification-badge'); // Get the element
            if (badge) { // Check if it exists before trying to remove
               badge.remove();  //Then remove it here.
            } else {
                updateHeader(); // Refresh the header *again* if badge not present
            }
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

// Toggle create post modal
function togglePostModal() {
    const modal = document.getElementById('create-post-modal');
    const isHidden = modal.style.display === 'none' || modal.style.display === '';
    modal.style.display = isHidden ? 'flex' : 'none';
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('create-post-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});

window.togglePostModal = togglePostModal;
window.searchPosts = searchPosts;
window.clearSearch = clearSearch;
