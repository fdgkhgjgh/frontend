// frontend/js/post-details.js
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
        displayPostDetails(post);
        displayComments(post.comments); // Pass the comments array

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
     authorDateElement.textContent = `By: ${post.author.username} on ${formatDate(post.createdAt)}`;
     contentContainer.appendChild(authorDateElement);


     const contentElement = document.createElement('p');
     contentElement.textContent = post.content;
     contentContainer.appendChild(contentElement);

    if (post.imageUrl) {
          const imgContainer = document.createElement('div');
            imgContainer.classList.add('image-container');

            const imgElement = document.createElement('img');
            imgElement.src = post.imageUrl;
            imgElement.alt = post.title;
            //No need set width and height in js, just set in css.
            imgContainer.appendChild(imgElement);
          //  postElement.appendChild(imgContainer); // Append image container to the *main* post element
            contentContainer.appendChild(imgContainer)
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
        const commentImage = document.getElementById('comment-image').files[0]; // Get the file
        const postId = new URLSearchParams(window.location.search).get('id');

        const formData = new FormData(); // Use FormData
        formData.append('text', commentText);
        if (commentImage) {
            formData.append('image', commentImage); // Append the file
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
               commentMessage.textContent = "You must be logged in to comment."
               commentMessage.style.color = 'red';
                return;
            }

            const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // DO NOT set Content-Type with FormData
                },
                body: formData, // Send the FormData
            });

            const data = await response.json();

            if (response.ok) {
                commentMessage.textContent = "Add comment success!";
                commentMessage.style.color = 'green';
                document.getElementById('comment-text').value = '';
                document.getElementById('comment-image').value = ''; // Clear the file input
                displayComments(data.comments)
            } else {
                 commentMessage.textContent = data.message
                commentMessage.style.color = 'red'
            }

        } catch (error) {
            console.error('Error adding comment:', error);
            commentMessage.textContent = "An error occurred while adding comment."
            commentMessage.style.color = 'red'
        }
    });
}
 //Display images
function displayComments(comments) {
 commentsList.innerHTML = ''; // Clear existing comments
 if (!comments || comments.length === 0) {
   commentsList.innerHTML = '<li>No comments yet.</li>';
   return;
 }
 comments.forEach(comment => {
     const commentItem = document.createElement('li');
     //Add image element
      let commentContent = `${comment.author.username}: ${comment.text} -- ${formatDate(comment.createdAt)}`;
     if(comment.imageUrl) {
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
     if (currentUserId && currentUserId === comment.author._id.toString()) {
           const deleteButton = document.createElement('button');
           deleteButton.textContent = "Delete";
           deleteButton.classList.add('delete-button');
           deleteButton.addEventListener('click', () => {
             deleteComment(comment._id, commentItem)
           });
           commentItem.appendChild(deleteButton);
       }
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
                    const data = await response.json()
                    throw new Error(`Voting failed: ${data.message}`);
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
// No need to add DOMContentLoaded, because it has been added in post-details.html

// Export
export {loadPostDetails}