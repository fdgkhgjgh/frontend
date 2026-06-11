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
showSkeleton();
    try {
        // Page 1 fetches 20 but shows 5 initially, other pages fetch 20
        const limit = page === 1 ? 20 : 20;
        const response = await fetch(`${API_BASE_URL}/posts?page=${page}&limit=${limit}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch posts: ${response.status}`);
        }
        const data = await response.json();
        const posts = data.posts;
        const totalPages = data.totalPages;

        if (page === 1) {
            displayPostsWithShowMore(posts);
        } else {
            displayPosts(posts);
        }
        displayPagination(totalPages, page);

    } catch (error) {
        console.error('Error loading posts:', error);
        postList.innerHTML = '<p>Error loading posts. Please try again later.</p>';
    }
}

function displayPostsWithShowMore(posts) {
    postList.innerHTML = '';
    const initialCount = 5;
    const allPosts = posts;
    let expanded = false;

    // Show first 5 posts
    allPosts.slice(0, initialCount).forEach(post => {
        postList.appendChild(createPostElement(post));
    });

    // Only add Show More if there are more than 5 posts
    if (allPosts.length <= initialCount) return;

    const showMoreBtn = document.createElement('button');
    showMoreBtn.textContent = `展开更多帖子Show More (${allPosts.length - initialCount})`;
    showMoreBtn.classList.add('show-more-btn');
showMoreBtn.style.cssText = `
    display: block;
    width: 100%;
    padding: 0.5px;
    margin: 4px 0;
    background: rgba(150, 150, 150, 0.2);
    border: 1px solid rgba(150, 150, 150, 0.3);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    color: #007BFF !important;
    `;

    showMoreBtn.addEventListener('click', () => {
        if (!expanded) {
            // Show remaining posts
            allPosts.slice(initialCount).forEach(post => {
                postList.insertBefore(createPostElement(post), showMoreBtn);
            });
            showMoreBtn.textContent = '收起 Show Less';
            expanded = true;
        } else {
            // Remove extra posts
            const allPostElements = postList.querySelectorAll('.post');
            allPostElements.forEach((el, index) => {
                if (index >= initialCount) el.remove();
            });
            showMoreBtn.textContent = `展开更多 Show More (${allPosts.length - initialCount})`;
            expanded = false;
        }
    });

    postList.appendChild(showMoreBtn);
}

// function displayPosts.
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');
    postElement.style.cssText = `
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        cursor: pointer;
    `;
    postElement.addEventListener('click', () => {
        window.location.href = `post-details.html?id=${post._id}`;
    });

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
    titleElement.style.fontSize = '1.1rem';

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

    const currentUserId = localStorage.getItem('userId');
    if (currentUserId && post.author && post.author._id && currentUserId === post.author._id.toString()) {
        const pinButton = document.createElement('button');
        pinButton.textContent = post.pinned ? 'Unpin' : 'Pin';
        pinButton.classList.add('pin-button');
        pinButton.dataset.postId = post._id;
        pinButton.addEventListener('click', (event) => {
            event.stopPropagation();
            pinUnpinPost(post._id, event.target);
        });
        textInfoContainer.appendChild(pinButton);
    }

    let mediaElement = null;
    if (post.imageUrls && post.imageUrls.length > 0) {
        mediaElement = document.createElement('img');
        mediaElement.src = post.imageUrls[0];
        mediaElement.alt = post.title;
        mediaElement.classList.add('post-list-image');
    } else if (post.videoUrls && post.videoUrls.length > 0) {
    const videoUrl = post.videoUrls[0];
    const isR2Video = videoUrl.includes('r2.dev');
    
    mediaElement = document.createElement('img');
    mediaElement.alt = post.title;
    mediaElement.classList.add('post-list-image');

    if (isR2Video) {
    const tempVideo = document.createElement('video');
    tempVideo.src = videoUrl;
    tempVideo.crossOrigin = 'anonymous';
    tempVideo.muted = true;
    tempVideo.currentTime = 1;

    tempVideo.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 70;
        canvas.height = 70;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(tempVideo, 0, 0, 70, 70);
        mediaElement.src = canvas.toDataURL('image/jpeg');
        tempVideo.remove();
    });

    tempVideo.addEventListener('error', () => {
        mediaElement.style.background = '#222';
        tempVideo.remove();
    });

    document.body.appendChild(tempVideo);
            tempVideo.load();
        } else {
        // Cloudinary video - show thumbnail
        mediaElement.src = videoUrl
            .replace('/upload/', '/upload/so_0/')
            .replace(/\.(mp4|mov|avi|webm)$/i, '.jpg');
        mediaElement.onerror = () => {
            mediaElement.style.background = '#333';
            mediaElement.src = '';
        };
    }
}

    postElement.appendChild(textInfoContainer);
    if (mediaElement) {
        postElement.appendChild(mediaElement);
    }

    return postElement;
}

function displayPosts(posts) {
    postList.innerHTML = '';
    posts.forEach(post => {
        postList.appendChild(createPostElement(post));
    });
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
    }

    // ✅ Page jump input - always visible
    if (totalPages > 1) {
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
                    if (isSearching) searchPosts(page);
                    else loadPosts(page);
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
                if (isSearching) searchPosts(page);
                else loadPosts(page);
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

        usernameDisplay.textContent = '登录为: ';  //Text before link
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
