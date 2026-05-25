import { formatDate } from './utils.js';
import { API_BASE_URL } from './config.js'; //Import API_BASE_URL

const postDetailsContainer = document.getElementById('post-details-container');
const commentsList = document.getElementById('comments-list');
const addCommentForm = document.getElementById('add-comment-form');
const commentMessage = document.getElementById('comment-message');
const commentsSection = document.getElementById('comments-section');

//--- ADD COMMENT BUTTON AND STATE MANAGEMENT ---
const addCommentButton = document.getElementById('add-comment-button');
const commentButtonSpinner = document.getElementById('comment-button-spinner');
const commentButtonSuccessIcon = document.getElementById('comment-button-success-icon');


// --- Load Post Details and Comments ---
async function loadPostDetails(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch post: ${response.status}`);
        }
        const post = await response.json();
        //console.log("Fetched post details:", post);
        displayPostDetails(post);
        displayComments(post.comments);

    } catch (error) {
        console.error('Error loading post details:', error);
        postDetailsContainer.innerHTML = '<p>Error loading post details.</p>';
    }
}
//  displayPostDetails function
function displayPostDetails(post) {
    postDetailsContainer.innerHTML = ''; // Clear previous details

    const postElement = document.createElement('div');
    postElement.classList.add('post');


    // --- Main Container for Content ---
    const contentContainer = document.createElement('div');
    contentContainer.classList.add('post-content');

    const titleElement = document.createElement('h2');
    titleElement.textContent = post.title;
    contentContainer.appendChild(titleElement);

    // --- Author and Date ---
    const authorDateElement = document.createElement('p');
    const profilePicture = document.createElement('img');
    profilePicture.classList.add('profile-picture');
    profilePicture.src = post.author.profilePictureUrl || 'assets/default-profile.png'; // Use a default image!
    profilePicture.alt = `${post.author.username}'s Profile Picture`;
    authorDateElement.appendChild(profilePicture);

    const authorLink = document.createElement('a');
    authorLink.href = `profile.html?id=${post.author._id}`; // Link to the profile page
    authorLink.textContent = ` ${post.author.username} `; //The username here

    authorDateElement.appendChild(authorLink) // Link to the profile page
    authorDateElement.append(` on ${formatDate(post.createdAt)}`);

    contentContainer.appendChild(authorDateElement);

    //... the contentContainer element IS added to the postElement, which is added to postDetailsContainer.
    postElement.appendChild(contentContainer);
    postDetailsContainer.appendChild(postElement);
    
   // content showing 
    const contentElement = document.createElement('p');
    if (post.content) {
        // Split content into lines
        const lines = post.content.split('\n');
        const maxLineChars = 45;
        const formattedContent = lines.map(line => {
            // Further split each line if it's longer than 45 characters
            let formattedLine = '';
            while (line.length > 0) {
                // Take the first 45 characters or less
                const segment = line.slice(0, maxLineChars);
                // Add to formatted line with a newline
                formattedLine += segment + '\n';
                // Remove the segment from the original line
                line = line.slice(maxLineChars);
            }
            // Trim the last newline character
            return formattedLine.trimEnd();
        }).join('\n'); // Join all formatted lines

        contentElement.textContent = formattedContent;
    } else {
        contentElement.textContent = ''; // or some placeholder if content is empty
    }
    const postBody = document.createElement('div');
postBody.classList.add('post-body');
postBody.appendChild(contentElement);
contentContainer.appendChild(postBody);

   // --- Media Container (Handles both Images and Videos) ---
   const mediaContainer = document.createElement('div');
   mediaContainer.classList.add('media-container'); // Common container for images AND videos

// --- Images ---
if (post.imageUrls && post.imageUrls.length > 0) {
    const imgContainer = document.createElement('div');
    imgContainer.classList.add('multi-image-container');
    post.imageUrls.forEach(imageUrl => {

        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = "Post Image";
        imgElement.classList.add('post-image');
        imgElement.addEventListener('click', () => {
            const modal = document.getElementById('image-modal');
            const modalImageContainer = document.getElementById('modal-image-container');

            modalImageContainer.innerHTML = '';

const clickedIndex = post.imageUrls.indexOf(imageUrl);

post.imageUrls.forEach(url => {
    const modalImg = document.createElement('img');
    modalImg.src = url;
    modalImg.alt = "Full Size Image";
    modalImageContainer.appendChild(modalImg);
});

// ✅ Scroll to the clicked image after images are added
setTimeout(() => {
    modalImageContainer.scrollLeft = clickedIndex * modalImageContainer.offsetWidth;
}, 50);

            // Force fullscreen via JS directly
            modal.style.cssText = `
                display: flex;
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #000;
                z-index: 99999;
                margin: 0;
                padding: 0;
            `;

            const modalContent = modal.querySelector('.modal-content');
            modalContent.style.cssText = `
                width: 100vw;
                height: 100vh;
                max-width: 100vw;
                max-height: 100vh;
                margin: 0;
                padding: 0;
                overflow: hidden;
            `;

            const carousel = document.getElementById('modal-image-carousel');
            carousel.style.cssText = `
                width: 100vw;
                height: 100vh;
            `;

            modalImageContainer.style.cssText = `
                display: flex;
                width: 100vw;
                height: 100vh;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                scroll-behavior: smooth;
            `;

            // Set each image to fullscreen size
            const allModalImgs = modalImageContainer.querySelectorAll('img');
            allModalImgs.forEach(img => {
                img.style.cssText = `
                    min-width: 100vw;
                    width: 100vw;
                    height: 100vh;
                    object-fit: contain;
                    flex-shrink: 0;
                    scroll-snap-align: start;
                `;
            });

            // PC: ✕ close button
            let existingCloseBtn = modal.querySelector('.modal-close-pc');
            if (!existingCloseBtn) {
                const closeBtn = document.createElement('button');
                closeBtn.textContent = '✕';
                closeBtn.classList.add('modal-close-pc');
                closeBtn.onclick = (e) => {
                    e.stopPropagation();
                    modal.style.display = 'none';
                };
                modal.appendChild(closeBtn);
            }

            // PC: click dark area to close
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            };

            // Mobile: swipe left/right to navigate images
let swipeTouchStartX = 0;
modalImageContainer.addEventListener('touchstart', (e) => {
    swipeTouchStartX = e.touches[0].clientX;
}, { passive: true });

modalImageContainer.addEventListener('touchend', (e) => {
    const swipeTouchEndX = e.changedTouches[0].clientX;
    const diffX = swipeTouchStartX - swipeTouchEndX;
    if (Math.abs(diffX) > 50) { // swipe at least 50px
        if (diffX > 0) {
            // swipe left = next image
            modalImageContainer.scrollLeft += modalImageContainer.offsetWidth;
        } else {
            // swipe right = previous image
            modalImageContainer.scrollLeft -= modalImageContainer.offsetWidth;
        }
    } else {
        // short tap = close
        modal.style.display = 'none';
    }
}, { passive: true });

            // PC: click left/right to navigate
            modalImageContainer.onclick = (e) => {
                e.stopPropagation();
                const rect = modalImageContainer.getBoundingClientRect();
                if (e.clientX - rect.left < rect.width / 2) {
                    modalImageContainer.scrollLeft -= modalImageContainer.offsetWidth;
                } else {
                    modalImageContainer.scrollLeft += modalImageContainer.offsetWidth;
                }
            };

            // Cursor direction
            modalImageContainer.onmousemove = (e) => {
                const rect = modalImageContainer.getBoundingClientRect();
                if (e.clientX - rect.left < rect.width / 2) {
                    modalImageContainer.classList.add('cursor-left');
                } else {
                    modalImageContainer.classList.remove('cursor-left');
                }
            };

        }); // closes imgElement click listener

        imgContainer.appendChild(imgElement);
    }); // closes forEach
    mediaContainer.appendChild(imgContainer);
}

 // Videos (using thumbnail)
if (post.videoUrls && post.videoUrls.length > 0) {
    const firstVideoUrl = post.videoUrls[0];

    // ✅ Correct Cloudinary thumbnail URL
    const thumbnailUrl = firstVideoUrl
        .replace('/upload/', '/upload/so_0/')
        .replace(/\.(mp4|mov|avi|webm)$/i, '.jpg');

    const videoThumbnailContainer = document.createElement('div');
    videoThumbnailContainer.classList.add('video-thumbnail-container');

    const imgElement = document.createElement('img');
    imgElement.src = thumbnailUrl;
    imgElement.alt = "Post Video";
    imgElement.style.cursor = 'pointer';
    imgElement.style.width = '100%';
    imgElement.style.height = '100%';
    imgElement.style.objectFit = 'cover';

    // ✅ Fallback if thumbnail fails to load
    imgElement.onerror = () => {
        imgElement.style.display = 'none';
        videoThumbnailContainer.style.background = '#333';
    };

    // ✅ Play icon
    const playIcon = document.createElement('div');
    playIcon.innerHTML = '&#9658;';
    playIcon.classList.add('video-play-icon');

    videoThumbnailContainer.appendChild(imgElement);
    videoThumbnailContainer.appendChild(playIcon);

const handleClick = () => {
    const inlineVideoContainer = document.createElement('div');
    inlineVideoContainer.style.cssText = `
        width: 240px;
        height: 190px;
        margin: 10px 0;
        display: inline-block;
        position: relative;
    `;

    const videoElement = document.createElement('video');
    videoElement.src = firstVideoUrl;
    videoElement.controls = true;
    videoElement.style.cssText = `
        width: 240px;
        height: 190px;
        object-fit: cover;
        border-radius: 5px;
        display: block;
    `;

    // Close button for PC
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: 6px;
        right: 6px;
        z-index: 20;
        background: rgba(0,0,0,0.5);
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
    `;
    closeBtn.onclick = () => {
        inlineVideoContainer.remove();
        videoThumbnailContainer.style.display = 'block';
    };

    inlineVideoContainer.appendChild(videoElement);
    inlineVideoContainer.appendChild(closeBtn);
    mediaContainer.insertBefore(inlineVideoContainer, videoThumbnailContainer);
    videoThumbnailContainer.style.display = 'none';

    videoElement.play().catch(error => console.log("Playback interaction error:", error));

                   // --- 1. HANDLE PAUSE EVENT ---
    videoElement.addEventListener('pause', () => {
        inlineVideoContainer.style.cssText = `
            width: 300px;
            height: 240px;
            margin: 10px 0;
            display: inline-block;
            position: relative;
            cursor: pointer;
        `;
        videoElement.style.cssText = `
            width: 300px;
            height: 240px;
            object-fit: cover;
            border-radius: 5px;
            display: block;
            cursor: pointer;
            pointer-events: auto;/* 🌟 FIX: Stop the video element from stealing/blocking desktop clicks! */
        `;
           }
    });

    videoElement.onclick = (e) => {
        e.stopPropagation(); 
        
        if (videoElement.paused) {
            playIcon.style.display = 'none'; 
            videoElement.play();
        } else {
            // Allows regular clicking on the running video frame to pause it
            videoElement.pause();
        }
    };
    // --- 4. CLEANUP EVENTS ---
    videoElement.addEventListener('ended', () => {
        inlineVideoContainer.remove();
        videoThumbnailContainer.style.display = 'block';
    });

    videoElement.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            inlineVideoContainer.remove();
            videoThumbnailContainer.style.display = 'block';
        }
    });

    videoElement.addEventListener('webkitfullscreenchange', () => {
        if (!document.webkitFullscreenElement) {
            inlineVideoContainer.remove();
            videoThumbnailContainer.style.display = 'block';
        }
    });
}; // Closes handleClick

    imgElement.addEventListener('click', handleClick);
    playIcon.addEventListener('click', handleClick);
    mediaContainer.appendChild(videoThumbnailContainer);



    const videoDownloadBtn = document.createElement('a');
    videoDownloadBtn.href = `${API_BASE_URL}/posts/${post._id}/download?url=${encodeURIComponent(firstVideoUrl)}`;
    videoDownloadBtn.textContent = '⬇ 下载此视频';
    videoDownloadBtn.classList.add('download-btn');
    mediaContainer.appendChild(videoDownloadBtn);
}
  
// Add the media container to the content (only if there are images OR videos)
if (post.imageUrls?.length > 0 || post.videoUrls?.length > 0) {
    postBody.appendChild(mediaContainer);
}

    // --- Like/Dislike Buttons ---
    const voteContainer = document.createElement('div');
    voteContainer.classList.add('vote-container');

    const likeButton = document.createElement('button');
    likeButton.classList.add('vote-button', 'like-button');
    likeButton.innerHTML = '👍'; // Thumbs Up Emoji
    likeButton.dataset.postId = post._id;
    likeButton.dataset.voteType = "upvote";
    voteContainer.appendChild(likeButton);

    //Upvotes span tag.
    const upvoteCount = document.createElement('span');
    upvoteCount.classList.add('vote-count');
    upvoteCount.id = `upvote-count-${post._id}`;
    upvoteCount.textContent = post.upvotes; //Set default upvotes.
    voteContainer.appendChild(upvoteCount);

    const dislikeButton = document.createElement('button');
    dislikeButton.classList.add('vote-button', 'dislike-button');
    dislikeButton.innerHTML = '👎';
    dislikeButton.dataset.postId = post._id;
    dislikeButton.dataset.voteType = "downvote";
    voteContainer.appendChild(dislikeButton);

    //Downvotes span tag.
    const downvoteCount = document.createElement('span');
    downvoteCount.classList.add('vote-count');
    downvoteCount.id = `downvote-count-${post._id}`;
    downvoteCount.textContent = post.downvotes; //Set default downvotes.
    voteContainer.appendChild(downvoteCount);

    // --- Save/Collect Button ---
const saveButton = document.createElement('button');
saveButton.classList.add('vote-button', 'save-button');
saveButton.innerHTML = '🔖';
saveButton.title = 'Save this post';
saveButton.style.marginLeft = '12px';

// Check if already saved
const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
if (savedPosts.includes(post._id)) {
    saveButton.style.opacity = '1';
    saveButton.title = 'Saved!';
} else {
    saveButton.style.opacity = '0.4';
}

saveButton.addEventListener('click', async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) { alert('Please login to save posts'); return; }

    const response = await fetch(`${API_BASE_URL}/auth/save-post/${post._id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.saved) {
        saveButton.style.opacity = '1';
        saveButton.title = 'Saved!';
        const saved = JSON.parse(localStorage.getItem('savedPosts') || '[]');
        saved.push(post._id);
        localStorage.setItem('savedPosts', JSON.stringify(saved));
    } else {
        saveButton.style.opacity = '0.4';
        saveButton.title = 'Save this post';
        const saved = JSON.parse(localStorage.getItem('savedPosts') || '[]');
        localStorage.setItem('savedPosts', JSON.stringify(saved.filter(id => id !== post._id)));
    }
});

voteContainer.appendChild(saveButton);
postBody.appendChild(voteContainer);

    postElement.appendChild(contentContainer);
    postDetailsContainer.appendChild(postElement);

}

// Function to set the comment button state
function setCommentButtonState(state) {
    switch (state) {
        case 'sending':
            addCommentButton.disabled = true;
            addCommentButton.textContent = 'Sending...';
            commentButtonSpinner.style.display = 'inline-block';
            commentButtonSuccessIcon.style.display = 'none';
            break;
        case 'success':
            addCommentButton.textContent = 'Commented!';
            commentButtonSpinner.style.display = 'none';
            commentButtonSuccessIcon.style.display = 'inline-block';
            break;
        case 'error':
            addCommentButton.textContent = 'Error!';
            commentButtonSpinner.style.display = 'none';
            commentButtonSuccessIcon.style.display = 'none';
            break;
        default:
            addCommentButton.disabled = false;
            addCommentButton.textContent = '添加评论(add Comment)';
            commentButtonSpinner.style.display = 'none';
            commentButtonSuccessIcon.style.display = 'none';
            break;
    }
}


// --- Add Comment Submission ---
if (addCommentForm) {
    addCommentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const commentText = document.getElementById('comment-text').value;
        const commentFile = document.getElementById('comment-file');
        const postId = new URLSearchParams(window.location.search).get('id');

        const formData = new FormData();
        formData.append('text', commentText);

        // Append each file to the FormData object
        if (commentFile && commentFile.files) {
            for (let i = 0; i < commentFile.files.length; i++) {
                formData.append('files', commentFile.files[i]);
            }
        }
        //console.log("FormData:", formData);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                commentMessage.textContent = "You must be logged in to comment.";
                commentMessage.style.color = 'red';
                return;
            }

            //--- SET BUTTON TO "SENDING" STATE ---
            setCommentButtonState('sending');

            const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {  // <--- CORRECTED URL
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,  // <--- CORRECTED HEADER
                },
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                commentMessage.textContent = "An error occurred while adding comment.";
                commentMessage.style.color = 'red';
                setCommentButtonState('default');
            } else {
                commentMessage.textContent = "Add comment success!";
                commentMessage.style.color = 'green';
                document.getElementById('comment-text').value = '';
                 if (commentFile){
                    commentFile.value = ''; //reset the file.
                }

                loadPostDetails(postId);
                setCommentButtonState('success'); // Ensure this is called AFTER loadPostDetails
                setTimeout(() => {
                    setCommentButtonState('default');
                }, 1500);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            commentMessage.textContent = "An error occurred while adding comment.";
            commentMessage.style.color = 'red';
            setCommentButtonState('error');
            setTimeout(() => {
                setCommentButtonState('default');
            }, 1500);
        }
    });
}

// Function to display comments
function displayComments(comments) {
    commentsList.innerHTML = ''; // Clear existing comments
    if (!comments || comments.length === 0) {
        commentsList.innerHTML = '<li>No comments yet.</li>';
        return;
    }
    comments.forEach((comment, index) => { // <--- ADDED INDEX HERE
        const commentItem = document.createElement('li');
        commentItem.classList.add('comment-item'); // ADDED CLASS

        // Add comment number
        const commentNumber = document.createElement('span');  // Create a span element
        commentNumber.classList.add('comment-number');  //Add comment-number class.
        commentNumber.textContent = `${index + 1}.`;  // Number, starting from 1
        commentItem.appendChild(commentNumber);  //Add the number to the comment item

        // --- ADD PROFILE PICTURE HERE ---
        const profilePicture = document.createElement('img');
        profilePicture.classList.add('profile-picture');
        profilePicture.src = comment.author?.profilePictureUrl || 'assets/default-profile.png'; // Use a default image!
        profilePicture.alt = `${comment.author?.username}'s Profile Picture`;  //Also use ? to prevent errors
        commentItem.appendChild(profilePicture);

        // --- ADD PROFILE PICTURE HERE ---
        const textElement = document.createElement('p');
        const usernameLink = document.createElement('a');  // Create an <a> tag
        usernameLink.href = `profile.html?id=${comment.author._id}`; // Set the href to the profile page
        usernameLink.textContent = comment.author?.username || "Unknown"; // Set the link text to the username

        textElement.append(usernameLink);  // Append the <a> tag to the <p>
        textElement.append(`: ${comment.text} -- ${formatDate(comment.createdAt)}`); // Add the rest of the comment content

        commentItem.appendChild(textElement); // Then append the <p> with the <a> and text content.

         // Add image display logic (similar to post detail, using the multi-image-container)
        if (comment.imageUrls && comment.imageUrls.length > 0) {
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('multi-image-container');

           comment.imageUrls.forEach(imageUrl => {
                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = "Comment Image";
                imgElement.classList.add('post-image');
                imgElement.style.maxWidth = '100%';
                imgElement.style.height = 'auto';

                imgContainer.appendChild(imgElement);
            });
            commentItem.appendChild(imgContainer);
        }

         // Add video display logic
if (comment.videoUrls && comment.videoUrls.length > 0) {
    const videoContainer = document.createElement('div');
    videoContainer.classList.add('multi-video-container');

    comment.videoUrls.forEach(videoUrl => {
        const mediaWrapper = document.createElement('div');
        mediaWrapper.classList.add('media-wrapper');

        const thumbContainer = document.createElement('div');
        thumbContainer.style.cssText = `
            width: 120px;
            height: 120px;
            position: relative;
            border-radius: 5px;
            overflow: hidden;
            background: #222;
            cursor: pointer;
            flex: none;
        `;

        const thumbImg = document.createElement('img');
        thumbImg.src = videoUrl
            .replace('/upload/', '/upload/so_0/')
            .replace(/\.(mp4|mov|avi|webm)$/i, '.jpg');
        thumbImg.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;
        thumbImg.onerror = () => {
            thumbImg.style.display = 'none';
            thumbContainer.style.background = '#333';
        };

        const playIcon = document.createElement('div');
        playIcon.innerHTML = '&#9658;';
        playIcon.classList.add('video-play-icon');

        thumbContainer.appendChild(thumbImg);
        thumbContainer.appendChild(playIcon);

        thumbContainer.addEventListener('click', () => {
            const videoElement = document.createElement('video');
            videoElement.src = videoUrl;
            videoElement.controls = true;
            videoElement.style.cssText = `
                width: 120px;
                height: 120px;
                object-fit: cover;
                border-radius: 5px;
            `;
            videoElement.autoplay = true;
            mediaWrapper.replaceChild(videoElement, thumbContainer);
        });

        const downloadBtn = document.createElement('a');
        downloadBtn.href = `${API_BASE_URL}/posts/${new URLSearchParams(window.location.search).get('id')}/download?url=${encodeURIComponent(videoUrl)}`;
        downloadBtn.textContent = '⬇ Download Video';
        downloadBtn.classList.add('download-btn');

        mediaWrapper.appendChild(thumbContainer);
        mediaWrapper.appendChild(downloadBtn);
        videoContainer.appendChild(mediaWrapper);
    });
    commentItem.appendChild(videoContainer);
}

        //Add delete button.
        const currentUserId = localStorage.getItem('userId');
        if (currentUserId && currentUserId === comment.author?._id.toString()) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Delete";
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', () => {
                deleteComment(comment._id, commentItem)
            });
            commentItem.appendChild(deleteButton);
        }
        // Add reply button
        const replyButton = document.createElement('button');
        replyButton.classList.add('reply-button');
        replyButton.textContent = '回复(Reply)';
        replyButton.dataset.commentId = comment._id; //Set the comment id
        commentItem.appendChild(replyButton);

        //Replies container
        const repliesContainer = document.createElement('div');
        repliesContainer.classList.add('replies-container');
        repliesContainer.id = `replies-${comment._id}`; //Unique ID for each comment.
        commentItem.appendChild(repliesContainer);

        loadReplies(comment._id, repliesContainer) //Call this one.

        commentsList.appendChild(commentItem);


    });
}
// Add event listener to the post details container (event delegation)
postDetailsContainer.addEventListener('click', async (event) => {
    if (event.target.classList.contains('vote-button') && !event.target.classList.contains('save-button')) {
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
                const data = await response.json();  // Parse the JSON response
                if (response.status === 400) {
                    alert(data.message); // Display the message from the backend
                } else {
                    throw new Error(`Voting failed: ${data.message}`); // For other errors
                }
                return; // Exit the function if voting failed
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

async function deleteComment(commentId, commentElement) {
    const postId = new URLSearchParams(window.location.search).get('id');
    // *** ADD CONFIRMATION DIALOG HERE ***
    const confirmDelete = confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) {
        return; // If the user cancels, exit the function
    }
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            // Remove the comment element from the DOM
            commentElement.remove();
            //console.log(data.message) // show message for success.
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert("An error occurred while deleting the comment.");
    }
}
// Add event listener for reply buttons
commentsList.addEventListener('click', (event) => {
    if (event.target.classList.contains('reply-button')) {
        const commentId = event.target.dataset.commentId;
        const replyToUserId = event.target.dataset.replyToUserId || null;
        const replyToUsername = event.target.dataset.replyToUsername || null;
        
        showReplyForm(commentId, replyToUserId, replyToUsername); 
    }
});

// Update showReplyForm to accept those parameters
function showReplyForm(commentId, replyToUserId = null, replyToUsername = null) {
    // Check if form already exists to avoid duplication
    const repliesContainer = document.getElementById(`replies-${commentId}`);
    const existingForm = repliesContainer.querySelector('.reply-form');
    if (existingForm) existingForm.remove();

    const replyForm = document.createElement('form');
    replyForm.classList.add('reply-form');
    replyForm.dataset.commentId = commentId;

    const replyTextarea = document.createElement('textarea');
    replyTextarea.classList.add('reply-textarea');
    replyTextarea.rows = 3;
    // 🌟 Make the placeholder clear about who they are replying to
    replyTextarea.placeholder = replyToUsername ? `Replying to @${replyToUsername}...` : 'Write your reply...';
    replyForm.appendChild(replyTextarea);

    const replyButton = document.createElement('button');
    replyButton.type = 'submit';
    replyButton.innerHTML = `Submit Reply <span id="reply-button-spinner" style="display: none;">&#x21bb;</span>`;
    replyForm.appendChild(replyButton);

    const replyButtonSpinner = replyForm.querySelector('#reply-button-spinner');

    function setReplyButtonState(state) {
        if (state === 'sending') {
            replyButton.disabled = true;
            replyButton.textContent = 'Sending...';
        } else {
            replyButton.disabled = false;
            replyButton.innerHTML = `Submit Reply <span id="reply-button-spinner" style="display: none;">&#x21bb;</span>`;
        }
    }

    repliesContainer.appendChild(replyForm);

    replyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const replyText = replyTextarea.value;
        const postId = new URLSearchParams(window.location.search).get('id');

        // 🌟 Pass replyToUserId to the API poster function
        addReply(postId, commentId, replyText, replyToUserId, repliesContainer, setReplyButtonState);
    });
}


// Function to add a reply
async function addReply(postId, commentId, replyText, replyToUser, repliesContainer, setReplyButtonState) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            commentMessage.textContent = "You must be logged in to reply.";
            commentMessage.style.color = 'red';
            return;
        }

        setReplyButtonState('sending');

        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            // 🌟 INCLUDE THE replyToUser FIELD IN THE JSON PAYLOAD
            body: JSON.stringify({ 
                text: replyText,
                replyToUser: replyToUser 
            }),
        });

        const data = await response.json();

        if (response.ok) {
            commentMessage.textContent = "Reply added successfully!";
            commentMessage.style.color = 'green';
            setTimeout(() => { commentMessage.textContent = ''; }, 2000);

            loadReplies(commentId, repliesContainer);
        } else {
            commentMessage.textContent = `Error adding reply: ${data.message || 'Unknown error'}`;
            commentMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Error adding reply:', error);
        commentMessage.textContent = "An error occurred while adding the reply.";
        commentMessage.style.color = 'red';
    } finally {
        setReplyButtonState('default');
    }
}

// Load replies function
async function loadReplies(commentId, repliesContainer) {
    repliesContainer.innerHTML = '';
  
    if (!/^[0-9a-fA-F]{24}$/.test(commentId)) {
      console.error('Invalid comment ID format:', commentId);
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/posts/comments/${commentId}/replies`); 
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch replies: ${response.status}`);
      }
      const replies = await response.json();
  
      if (replies.length > 0) {
        replies.forEach(reply => {
          const replyElement = document.createElement('div');
          replyElement.classList.add('reply');

           // Profile Picture
           const profilePicture = document.createElement('img');
           profilePicture.classList.add('profile-picture');
           profilePicture.src = reply.author?.profilePictureUrl || 'assets/default-profile.png';
           profilePicture.alt = `${reply.author?.username}'s Profile Picture`;
           replyElement.appendChild(profilePicture);

           // Author Link
           const usernameLink = document.createElement('a'); 
           usernameLink.href = `profile.html?id=${reply.author?._id}`;
           usernameLink.textContent = reply.author?.username || "Unknown";
           replyElement.appendChild(usernameLink);

           // 🌟 NEW: Check if this is a reply to another reply and add the "@username" tag
           const textSpan = document.createElement('span');
           if (reply.replyToUser && reply.replyToUser.username) {
               textSpan.innerHTML = ` to <a href="profile.html?id=${reply.replyToUser._id}">@${reply.replyToUser.username}</a>: ${reply.text} -- ${formatDate(reply.createdAt)}`;
           } else {
               textSpan.textContent = `: ${reply.text} -- ${formatDate(reply.createdAt)}`;
           }
           replyElement.appendChild(textSpan);

            // Delete Button logic
            const currentUserId = localStorage.getItem('userId');
            if (currentUserId && currentUserId === reply.author?._id.toString()) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-button');
                deleteButton.addEventListener('click', () => {
                    deleteReply(reply._id, replyElement, commentId);
                });
                replyElement.appendChild(deleteButton);
            }

            // 🌟 NEW: Add a Reply Button to this sub-reply item!
            const subReplyButton = document.createElement('button');
            subReplyButton.classList.add('reply-button', 'sub-reply-btn');
            subReplyButton.textContent = '回复 (Reply)';
            // Crucial: The commentId remains the top-level parent ID so it stays in this column!
            subReplyButton.dataset.commentId = commentId; 
            subReplyButton.dataset.replyToUserId = reply.author?._id;
            subReplyButton.dataset.replyToUsername = reply.author?.username;
            replyElement.appendChild(subReplyButton);

           repliesContainer.appendChild(replyElement);
        });
      } else {
        repliesContainer.textContent = "No replies yet.";
      }

      // View more collapse animation logic... (Keep your existing execution code here)
      if (replies.length > 5) {
         repliesContainer.classList.add('overlapped-replies');
         const viewMoreButton = document.createElement('button');
         viewMoreButton.textContent = '展开更多回复';
         viewMoreButton.classList.add('view-more-replies-button');
         viewMoreButton.addEventListener('click', () => {
             repliesContainer.classList.remove('overlapped-replies');
             viewMoreButton.style.display = 'none';
         });
         repliesContainer.appendChild(viewMoreButton);
      }
  
    } catch (error) {
      console.error('Error loading replies:', error);
    }
}

//delete reply
async function deleteReply(replyId, replyElement, commentId) {
    if (!confirm('Delete this reply?')) return;

    try {
        const token = localStorage.getItem('token');
        const postId = new URLSearchParams(window.location.search).get('id');

        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies/${replyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            replyElement.remove();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to delete reply');
        }
    } catch (error) {
        console.error('Error deleting reply:', error);
        alert('Failed to delete reply');
    }
}


//Click to zoom in
commentsList.addEventListener('click', (event) => {
    if (event.target.tagName === 'IMG' && event.target.classList.contains('post-image')) {
        const imageUrls = [];

        // Get the image URLs from the comment
        let currentElement = event.target.parentElement;
        while (currentElement && !currentElement.classList.contains('comment-item')) {
            currentElement = currentElement.parentElement;
        }

        if (currentElement) {
            const imageElements = currentElement.querySelectorAll('img.post-image');
            imageElements.forEach(img => {
                imageUrls.push(img.src);
            });
        }

        if (imageUrls.length > 0) {
            const modal = document.getElementById('image-modal');
            const modalImageContainer = document.getElementById('modal-image-container');

            modalImageContainer.innerHTML = '';

            imageUrls.forEach(imageUrl => {
                const modalImg = document.createElement('img');
                modalImg.src = imageUrl;
                modalImg.alt = "Full Size Image";
                modalImageContainer.appendChild(modalImg);
            });

            if (modal) {
                // Force fullscreen via JS
                modal.style.cssText = `
                    display: flex;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: #000;
                    z-index: 99999;
                    margin: 0;
                    padding: 0;
                `;

                const modalContent = modal.querySelector('.modal-content');
                modalContent.style.cssText = `
                    width: 100vw;
                    height: 100vh;
                    max-width: 100vw;
                    max-height: 100vh;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                `;

                const carousel = document.getElementById('modal-image-carousel');
                carousel.style.cssText = `
                    width: 100vw;
                    height: 100vh;
                `;

                modalImageContainer.style.cssText = `
                    display: flex;
                    width: 100vw;
                    height: 100vh;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    scroll-behavior: smooth;
                `;

                // Set each image to fullscreen size
                const allModalImgs = modalImageContainer.querySelectorAll('img');
                allModalImgs.forEach(img => {
                    img.style.cssText = `
                        min-width: 100vw;
                        width: 100vw;
                        height: 100vh;
                        object-fit: contain;
                        flex-shrink: 0;
                        scroll-snap-align: start;
                    `;
                });

                // PC: ✕ close button
                let existingCloseBtn = modal.querySelector('.modal-close-pc');
                if (!existingCloseBtn) {
                    const closeBtn = document.createElement('button');
                    closeBtn.textContent = '✕';
                    closeBtn.classList.add('modal-close-pc');
                    closeBtn.onclick = (e) => {
                        e.stopPropagation();
                        modal.style.display = 'none';
                    };
                    modal.appendChild(closeBtn);
                }

                // PC: click dark area to close
                modal.onclick = (e) => {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                };

                // Mobile: swipe left/right to navigate images
let swipeTouchStartX = 0;
modalImageContainer.addEventListener('touchstart', (e) => {
    swipeTouchStartX = e.touches[0].clientX;
}, { passive: true });

modalImageContainer.addEventListener('touchend', (e) => {
    const swipeTouchEndX = e.changedTouches[0].clientX;
    const diffX = swipeTouchStartX - swipeTouchEndX;
    if (Math.abs(diffX) > 50) { // swipe at least 50px
        if (diffX > 0) {
            // swipe left = next image
            modalImageContainer.scrollLeft += modalImageContainer.offsetWidth;
        } else {
            // swipe right = previous image
            modalImageContainer.scrollLeft -= modalImageContainer.offsetWidth;
        }
    } else {
        // short tap = close
        modal.style.display = 'none';
    }
}, { passive: true });

                // PC: click left/right to navigate
                modalImageContainer.onclick = (e) => {
                    e.stopPropagation();
                    const rect = modalImageContainer.getBoundingClientRect();
                    if (e.clientX - rect.left < rect.width / 2) {
                        modalImageContainer.scrollLeft -= modalImageContainer.offsetWidth;
                    } else {
                        modalImageContainer.scrollLeft += modalImageContainer.offsetWidth;
                    }
                };
            }
           
        

        }
    }
});

// Export
export { loadPostDetails };
