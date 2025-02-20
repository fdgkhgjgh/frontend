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
    contentContainer.appendChild(contentElement);

    // --- Media Container (Handles both Images and Videos) ---
    const mediaContainer = document.createElement('div');
    mediaContainer.classList.add('media-container'); // Common container for images AND videos

    // --- Images ---
    if (post.imageUrls && post.imageUrls.length > 0) {
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('multi-image-container');  // This class for layout
        post.imageUrls.forEach(imageUrl => {
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = "Post Image";
            imgElement.classList.add('post-image'); // Style individual image
            imgElement.addEventListener('click', () => {
                const modal = document.getElementById('image-modal');
                const modalImageContainer = document.getElementById('modal-image-container');
                const closeButton = document.querySelector('.close-button');

                // Clear existing images
                modalImageContainer.innerHTML = '';

                // Create and append images to modal
                post.imageUrls.forEach(imageUrl => {
                    const modalImg = document.createElement('img');
                    modalImg.src = imageUrl;
                    modalImg.alt = "Full Size Image";
                    modalImageContainer.appendChild(modalImg);
                });

                modal.style.display = 'flex';

                closeButton.addEventListener('click', () => {
                    modal.style.display = 'none';
                });

                  //Next Button
                const nextButton = document.getElementById('next-button');
                  nextButton.addEventListener('click', () => {
                       modalImageContainer.scrollLeft += modalImageContainer.offsetWidth;
                    });

                  //Previous Button
                  const prevButton = document.getElementById('prev-button');
                  prevButton.addEventListener('click', () => {
                        modalImageContainer.scrollLeft -= modalImageContainer.offsetWidth;
                  });
            });
            imgContainer.appendChild(imgElement);
        });
        mediaContainer.appendChild(imgContainer); // Add images to the MEDIA CONTAINER!
    }

    //Videos
    if (post.videoUrls && post.videoUrls.length > 0) {
        const videoContainer = document.createElement('div');
        videoContainer.classList.add('multi-video-container'); //Layout class name.
        post.videoUrls.forEach(videoUrl => {
            const videoElement = document.createElement('video');
            videoElement.src = videoUrl;
            videoElement.alt = "Post Video";
            videoElement.controls = true; //Enable video controls.
            videoElement.classList.add('post-video'); //Style for videos.
            videoContainer.appendChild(videoElement);
        });
        mediaContainer.appendChild(videoContainer); //Add videos to media container.
    }

    // Add the media container to the content (only if there are images OR videos)
    if (post.imageUrls?.length > 0 || post.videoUrls?.length > 0) {
        contentContainer.appendChild(mediaContainer);
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

    contentContainer.appendChild(voteContainer);

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
        const commentFile = document.getElementById('comment-file').files[0];
        const postId = new URLSearchParams(window.location.search).get('id');

        const formData = new FormData();
        formData.append('text', commentText);
        if (commentFile) {
            formData.append('file', commentFile);
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                commentMessage.textContent = "You must be logged in to comment.";
                commentMessage.style.color = 'red';
                return;
            }

            //--- SET BUTTON TO "SENDING" STATE ---
            setCommentButtonState('sending');  // <--- SET THE STATE HERE

            const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
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
                setCommentButtonState('default');
            }
            else {
                commentMessage.textContent = "Add comment success!";
                commentMessage.style.color = 'green';
                document.getElementById('comment-text').value = '';
                document.getElementById('comment-file').value = '';
                loadPostDetails(postId)

                //--- SET BUTTON TO "SUCCESS" STATE ---
                setCommentButtonState('success');

                //--- RESET BUTTON AFTER A DELAY ---
                setTimeout(() => {
                    setCommentButtonState('default');
                }, 1500); // 1.5 seconds (adjust as needed)
            }

        } catch (error) {
            console.error('Error adding comment:', error);
            commentMessage.textContent = "An error occurred while adding comment.";
            commentMessage.style.color = 'red';
            setCommentButtonState('error');
            setTimeout(() => {
                    setCommentButtonState('default');
                }, 1500); // 1.5 seconds (adjust as needed)

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

        //Add file element
        let commentContent = `${comment.author?.username || "Unknown"}: ${comment.text} -- ${formatDate(comment.createdAt)}`; // Check before rendering
        let mediaElement = null;

        if (comment.imageUrl) {
            mediaElement = document.createElement('img');
            mediaElement.src = comment.imageUrl;
            mediaElement.alt = "Comment Image"; //Add alt
            mediaElement.style.maxWidth = '100%';  // Set maxWidth
            mediaElement.style.height = 'auto';    //Keep ratio
        } else if (comment.videoUrl) {
            mediaElement = document.createElement('video');
            mediaElement.src = comment.videoUrl;
            mediaElement.alt = "Comment Video";
            mediaElement.controls = true;
            mediaElement.style.maxWidth = '100%';
            mediaElement.style.maxHeight = '300px';
        }

        if (mediaElement) {
            commentItem.appendChild(mediaElement);
        }

        const textElement = document.createElement('p');
        const usernameLink = document.createElement('a');  // Create an <a> tag
        usernameLink.href = `profile.html?id=${comment.author._id}`; // Set the href to the profile page
        usernameLink.textContent = comment.author?.username || "Unknown"; // Set the link text to the username

        textElement.append(usernameLink);  // Append the <a> tag to the <p>
        textElement.append(`: ${comment.text} -- ${formatDate(comment.createdAt)}`); // Add the rest of the comment content

        commentItem.appendChild(textElement); // Then append the <p> with the <a> and text content.

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
    if (!/^[0-9a-fA-F]{24}$/.test(commentId)) {  // Corrected ObjectId Validation
      console.error('Invalid comment ID format:', commentId);
      repliesContainer.textContent = 'Invalid comment ID format. Please try again.';
      return;
    }
  
    try {
      //console.log('Comment ID before fetch:', commentId);
      const response = await fetch(`${API_BASE_URL}/posts/comments/${commentId}/replies`); // Corrected URL
      //console.log('Fetch response status:', response.status);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch replies: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      const replies = await response.json();
  
      //console.log('Fetched replies:', replies);
  
      if (replies.length > 0) {
        replies.forEach(reply => {
          const replyElement = document.createElement('div');
          replyElement.classList.add('reply');

           // --- ADD PROFILE PICTURE HERE ---
           const profilePicture = document.createElement('img');
           profilePicture.classList.add('profile-picture');
           profilePicture.src = reply.author?.profilePictureUrl || 'assets/default-profile.png'; // Use a default image!
           profilePicture.alt = `${reply.author?.username}'s Profile Picture`;  //Also use ? to prevent errors
           replyElement.appendChild(profilePicture);

           //NEW CODE HERE!
           const usernameLink = document.createElement('a');  // Create an <a> tag
           usernameLink.href = `profile.html?id=${reply.author._id}`; // Set the href to the profile page
           usernameLink.textContent = reply.author?.username || "Unknown"; // Set the link text to the username

           replyElement.append(usernameLink);  // Append the <a> tag to the <p>
           replyElement.append(`: ${reply.text} -- ${formatDate(reply.createdAt)}`); // Add the rest of the comment content

            // --- ADD DELETE BUTTON HERE ---
            const currentUserId = localStorage.getItem('userId');
            if (currentUserId && currentUserId === reply.author?._id.toString()) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-button');
                deleteButton.dataset.replyId = reply._id; // Store reply ID as dataset
                deleteButton.addEventListener('click', (event) => {
                    deleteReply(reply._id, replyElement, commentId); // Pass commentId here
                });
                replyElement.appendChild(deleteButton);
            }
           repliesContainer.appendChild(replyElement);
        });
      } else {
        repliesContainer.textContent = "No replies yet.";
      }
      if (replies.length > 5) {
        repliesContainer.classList.add('overlapped-replies');
  
        // Create "View More" button
        const viewMoreButton = document.createElement('button');
        viewMoreButton.textContent = 'View More Replies';
        viewMoreButton.classList.add('view-more-replies-button');
  
        // Attach click listener to the button
        viewMoreButton.addEventListener('click', () => {
          repliesContainer.classList.remove('overlapped-replies'); // Remove the class that hides the content
          viewMoreButton.style.display = 'none'; // Hide the "View More" button after click
        });
  
        repliesContainer.appendChild(viewMoreButton);
      }
  
    } catch (error) {
      console.error('Error loading replies:', error);
      repliesContainer.textContent = `Error loading replies: ${error.message}`;
    }
  }

  //delete reply
  async function deleteReply(replyId, replyElement, commentId) {
    const postId = new URLSearchParams(window.location.search).get('id'); // Get post ID

    const confirmDelete = confirm("Are you sure you want to delete this reply?");
    if (!confirmDelete) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies/${replyId}`, { // Corrected URL
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            // Remove the reply element from the DOM
            replyElement.remove();
            commentMessage.textContent = data.message; // Display a message.
            commentMessage.style.color = 'green';
        } else {
            commentMessage.textContent = `Error: ${data.message}`;
            commentMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Error deleting reply:', error);
        commentMessage.textContent = "An error occurred while deleting the reply.";
        commentMessage.style.color = 'red';
    }
}

// Export
export { loadPostDetails }
