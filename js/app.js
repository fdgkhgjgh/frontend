// frontend/js/app.js
const postList = document.getElementById('post-list');
const API_BASE_URL = 'https://backend-5be9.onrender.com/api'; //  Or your Render backend URL
const commentModal = document.getElementById('comment-modal'); //Comment form container.
const commentForm = document.getElementById('add-comment-form');
const commentText = document.getElementById('comment-text');
const commentPostId = document.getElementById('comment-post-id'); //Hidden input value.
const commentMessage = document.getElementById("comment-message");

async function loadPosts() {
	//...The same as before. No changed.
}

function displayPosts(posts) {
    postList.innerHTML = ''; // Clear existing posts

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // ... (existing post display code - title, author, content, image, details link) ...
        const titleElement = document.createElement('h2');
        titleElement.textContent = post.title;
        postElement.appendChild(titleElement);

        const authorElement = document.createElement('p');
        authorElement.textContent = `By: ${post.author.username}`; // Display the author's username
        postElement.appendChild(authorElement);

        const contentElement = document.createElement('p');
        contentElement.textContent = post.content.substring(0, 150); // Show a preview
        postElement.appendChild(contentElement);


        if (post.imageUrl) {
            const imgElement = document.createElement('img');
            imgElement.src = post.imageUrl;
            imgElement.alt = post.title;
            imgElement.style.maxWidth = '100%'; // Ensure images fit within the container
            imgElement.style.height = 'auto';
            postElement.appendChild(imgElement);
        }

        const detailsLink = document.createElement('a');
        detailsLink.href = '#';  // Replace with the post detail page URL (future feature).
        detailsLink.textContent = 'View Details';
        postElement.appendChild(detailsLink);
        // --- DELETE BUTTON LOGIC --- (Existing delete button logic)
        const currentUserId = localStorage.getItem('userId');
        if (currentUserId && currentUserId === post.author._id.toString()) {
            // Only show the delete button if the current user is the author
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-button'); // Add a class for styling
            deleteButton.addEventListener('click', () => {
                deletePost(post._id, postElement); // Pass the post ID *and* the element
            });
            postElement.appendChild(deleteButton);
        }

        // --- COMMENT SECTION ---
        const commentsSection = document.createElement('div');
        commentsSection.classList.add('comments-section');

        const commentsHeading = document.createElement('h3');
        commentsHeading.textContent = 'Comments';
        commentsSection.appendChild(commentsHeading);

        // Display existing comments
        if (post.comments && post.comments.length > 0) {
            const commentsList = document.createElement('ul');
            post.comments.forEach(comment => {
                const commentItem = document.createElement('li');
                commentItem.textContent = `${comment.author.username}: ${comment.text}`;

                //Add comment delete button.
                 if (currentUserId && currentUserId === comment.author._id.toString()) {

                    const deleteCommentButton = document.createElement('button');
                     deleteCommentButton.textContent = 'Delete';
                     deleteCommentButton.classList.add('delete-button');
                     deleteCommentButton.addEventListener('click', () => {
                        deleteComment(post._id, comment._id, commentItem); // Pass post ID, comment ID, and list item
                     })
                     commentItem.appendChild(deleteCommentButton);  //Append delete button to comment.
                 }

                commentsList.appendChild(commentItem);
            });
            commentsSection.appendChild(commentsList);
        } else {
            const noComments = document.createElement('p');
            noComments.textContent = 'No comments yet.';
            commentsSection.appendChild(noComments);
        }

        // Add Comment Button
        const addCommentButton = document.createElement('button');
        addCommentButton.textContent = 'Add Comment';
        addCommentButton.classList.add('add-comment-button'); //for style.
        addCommentButton.addEventListener('click', () => {
           // Show comment form
           commentPostId.value = post._id; // Set the post ID in hidden form.
           commentModal.style.display = 'block'; // Show the modal

        });
        commentsSection.appendChild(addCommentButton);

        postElement.appendChild(commentsSection);
        postList.appendChild(postElement);
    });
}

// --- ADD COMMENT FUNCTION ---
if(commentForm){

  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const postId = commentPostId.value;  //Get post id from hidden form.
    const text = commentText.value;
    const token = localStorage.getItem('token');

    if (!token) {
        commentMessage.textContent = 'You must be logged in to comment.';
        commentMessage.style.color = 'red';

        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ text }),
        });

        const data = await response.json();
        if (response.ok) {
            // Success:
            commentMessage.textContent = 'Comment added successfully!';
            commentMessage.style.color = 'green';
            commentText.value = ''; // Clear the textarea
            commentModal.style.display = 'none';  //Hide comment form.
            displayPosts(data);  //important, Reload posts with new comment.


        } else {
            // Handle errors from the backend
           commentMessage.textContent = data.message;
           commentMessage.style.color = "red";
        }

    } catch (error) {
        console.error('Error adding comment:', error);
        commentMessage.textContent = "An error occurred while adding comment.";
        commentMessage.style.color = 'red';
    }
});
}


async function deletePost(postId, postElement) {
	//...The same as before, no changed.
}

//Delete comment function.
async function deleteComment(postId, commentId, commentItem) {
    const confirmDelete = confirm("Are you sure you want to delete this comment?");
     if (!confirmDelete) return;

     try {
         const token = localStorage.getItem('token');
         const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`,
            }
         });

         const data = await response.json();
         if (response.ok) {
            commentItem.remove();  // Remove the comment element from the DOM.
         } else {
            alert(`Error deleting comment: ${data.message}`); // Show error message
         }


     } catch(error) {
        console.error("Error deleting comment:", error);
        alert("An error occurred while deleting comment.")
     }
}

//Setup modal.
function setupModal() {
  const closeButton = document.querySelector('.close-button');

   // Close the modal when the close button is clicked
   if(closeButton){  //Check if it exists.
     closeButton.addEventListener('click', () => {
       commentModal.style.display = 'none';
      });
   }

  // Close the modal when clicking outside the modal content
   window.addEventListener('click', (event) => {
     if (event.target === commentModal) {
       commentModal.style.display = 'none';
      }
    });
}