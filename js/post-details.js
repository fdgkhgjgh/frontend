import { formatDate } from './utils.js';
import { API_BASE_URL } from './config.js'; //Import API_BASE_URL

const postDetailsContainer = document.getElementById('post-details-container');
const commentsList = document.getElementById('comments-list');
const addCommentForm = document.getElementById('add-comment-form');
const commentMessage = document.getElementById('comment-message');
const commentsSection = document.getElementById('comments-section');

// --- Load Post Details and Comments ---
async function loadPostDetails(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch post: ${response.status}`);
        }
        const post = await response.json();
        console.log("Fetched post details:", post);
        displayPostDetails(post);
        displayComments(post.comments);

    } catch (error) {
        console.error('Error loading post details:', error);
        postDetailsContainer.innerHTML = '<p>Error loading post details.</p>';
    }
}

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
    authorDateElement.textContent = `By: ${post.author?.username || "Unknown"} on ${formatDate(post.createdAt)}`; //Use optional chaining
    contentContainer.appendChild(authorDateElement);

    const contentElement = document.createElement('p');
    contentElement.textContent = post.content;
    contentContainer.appendChild(contentElement);

    // --- Images ---
    if (post.imageUrls && post.imageUrls.length > 0) {
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('image-container');
        imgContainer.style.display = 'flex'; //Use flex display.
        imgContainer.style.flexDirection = 'column'; //Vertical align.
        imgContainer.style.alignItems = 'center';   //Center images.

        post.imageUrls.forEach(imageUrl => {
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = "Post Image";
            imgElement.style.maxWidth = '100%';
            imgElement.style.maxHeight = '300px'; //Adjust max height
            imgElement.style.marginBottom = '10px'; //Optional spacing
            imgContainer.appendChild(imgElement);
        });
        contentContainer.appendChild(imgContainer);
    }

    //Videos
    if (post.videoUrls && post.videoUrls.length > 0) {
        const videoContainer = document.createElement('div');
        videoContainer.classList.add('video-container');
        videoContainer.style.display = 'flex';
        videoContainer.style.flexDirection = 'column';
        videoContainer.style.alignItems = 'center';

        post.videoUrls.forEach(videoUrl => {
            const videoElement = document.createElement('video');
            videoElement.src = videoUrl;
            videoElement.alt = "Post Video";
            videoElement.controls = true; //Enable video controls.
            videoElement.style.maxWidth = '100%';
            videoElement.style.maxHeight = '300px';
            videoElement.style.marginBottom = '10px';

            videoContainer.appendChild(videoElement);
        });
        contentContainer.appendChild(videoContainer);
    }
    // --- Like/Dislike Buttons ---
    const voteContainer = document.createElement('div');
    voteContainer.classList.add('vote-container');

    const likeButton = document.createElement('button');
    likeButton.classList.add('vote-button', 'like-button');
    likeButton.innerHTML = '&#x25B2;'; // Up arrow (▲)
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
    dislikeButton.innerHTML = '&#x25BC;'; // Down arrow (▼)
    dislikeButton.dataset.postId = post._id;
    dislikeButton.dataset.voteType = "downvote";
    voteContainer.appendChild(dislikeButton);

    //Downvotes span tag.
    const downvoteCount = document.createElement('span');
    downvoteCount.classList.add('vote-count');
    downvoteCount.id = `downvote-count-${post._id}`;
    downvoteCount.textContent = post.downvotes; //Set default downvotes.
    voteContainer.appendChild(downvoteCount);

    contentContainer.appendChild(voteContainer);

    postElement.appendChild(contentContainer);
    postDetailsContainer.appendChild(postElement);

}

// --- Add Comment Submission ---

if (addCommentForm) {
    addCommentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const commentText = document.getElementById('comment-text').value;
        const commentImage = document.getElementById('comment-image').files[0];
        const postId = new URLSearchParams(window.location.search).get('id');

        const formData = new FormData();
        formData.append('text', commentText);
        if (commentImage) {
            formData.append('image', commentImage);
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                commentMessage.textContent = "You must be logged in to comment.";
                commentMessage.style.color = 'red';
                return;
            }

            const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, { // CORRECTED THIS LINE
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });
            const data = await response.json(); //VERY IMPORTANTE
            if (!response.ok) { //This to know there is an error.
                commentMessage.textContent = "An error occurred while adding comment."
                commentMessage.style.color = 'red'
            }
            else {
                commentMessage.textContent = "Add comment success!";
                commentMessage.style.color = 'green';
                document.getElementById('comment-text').value = '';
                document.getElementById('comment-image').value = '';
                loadPostDetails(postId)
            }

        } catch (error) {
            console.error('Error adding comment:', error);
            commentMessage.textContent = "An error occurred while adding comment.";
            commentMessage.style.color = 'red';
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
    comments.forEach(comment => {
        const commentItem = document.createElement('li');

        //Add image element
        let commentContent = `${comment.author?.username || "Unknown"}: ${comment.text} -- ${formatDate(comment.createdAt)}`; // Check before rendering
        if (comment.imageUrl) {
            const imgElement = document.createElement('img');
            imgElement.src = comment.imageUrl;
            imgElement.alt = "Comment Image"; //Add alt
            imgElement.style.maxWidth = '100%';  // Set maxWidth
            imgElement.style.height = 'auto';    //Keep ratio
            commentItem.appendChild(imgElement);  //Append image first .
        }
        const textElement = document.createElement('p');
        textElement.textContent = commentContent;
        commentItem.appendChild(textElement); // Then append text content.

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
          replyButton.textContent = 'Reply';
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
            console.log(data.message) // show message for success.
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
        showReplyForm(commentId); //Display reply form.
    }
});

// Function to show the reply form
function showReplyForm(commentId) {
    // Create reply form
    const replyForm = document.createElement('form');
    replyForm.classList.add('reply-form');
    replyForm.dataset.commentId = commentId;

    const replyTextarea = document.createElement('textarea');
    replyTextarea.classList.add('reply-textarea');
    replyTextarea.rows = 3;
    replyTextarea.placeholder = 'Write your reply...';
    replyForm.appendChild(replyTextarea);

    const replyButton = document.createElement('button');
    replyButton.type = 'submit';
    replyButton.textContent = 'Submit Reply';
    replyForm.appendChild(replyButton);

    // Add the form to the replies container
    const repliesContainer = document.getElementById(`replies-${commentId}`);
    repliesContainer.appendChild(replyForm);

    //Add event listener to form.
    replyForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const replyText = replyTextarea.value; // The text of the reply
        const postId = new URLSearchParams(window.location.search).get('id'); // Post id

        //Call addReply function .
        addReply(postId, commentId, replyText, repliesContainer);
    });
}
// Function to add a reply
async function addReply(postId, commentId, replyText, repliesContainer) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            commentMessage.textContent = "You must be logged in to reply.";
            commentMessage.style.color = 'red';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ text: replyText }),
        });

        const data = await response.json();

        if (response.ok) {
            commentMessage.textContent = "Reply added successfully!";
            commentMessage.style.color = 'green';
            //Clear the message and Load replies.
            commentMessage.textContent = '';

            //Add load replies again.
            loadReplies(commentId, repliesContainer)
        } else {
            commentMessage.textContent = `Error adding reply: ${data.message || 'Unknown error'}`;
            commentMessage.style.color = 'red';
        }

    } catch (error) {
        console.error('Error adding reply:', error);
        commentMessage.textContent = "An error occurred while adding the reply.";
        commentMessage.style.color = 'red';
    }
}
// Load replies function
async function loadReplies(commentId, repliesContainer) {
    repliesContainer.innerHTML = '';

    // Check if commentId is a valid MongoDB ObjectId
    if (!/^[0-9a-fA-F]{24}$/.test(commentId)) {
        console.error('Invalid comment ID format:', commentId);
        repliesContainer.textContent = 'Invalid comment ID format. Please try again.';
        return;
    }

    try {
        console.log('Comment ID before fetch:', commentId);
        const response = await fetch(`${API_BASE_URL}/posts/comments/${commentId}/replies`);
        console.log('Fetch response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to fetch replies: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }
        const replies = await response.json();

        console.log('Fetched replies:', replies);
        
        if (replies.length > 0) {
            replies.forEach(reply => {
                const replyElement = document.createElement('div');
                replyElement.classList.add('reply');
                replyElement.textContent = `${reply.author.username}: ${reply.text} -- ${formatDate(reply.createdAt)}`;
                repliesContainer.appendChild(replyElement);
            });
        } else {
            repliesContainer.textContent = "No replies yet.";
        }
        if (replies.length > 5) {
            repliesContainer.classList.add('overlapped-replies');
        }

    } catch (error) {
        console.error('Error loading replies:', error);
        repliesContainer.textContent = `Error loading replies: ${error.message}`;
    }
}
// Export
export { loadPostDetails }
