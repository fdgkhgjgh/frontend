// frontend/js/app.js
import { formatDate } from './utils.js';
import { checkLoginStatus } from './auth.js';

const postList = document.getElementById('post-list');
const createPostFormMain = document.getElementById('create-post-form-main');
const createPostMessageMain = document.getElementById('create-post-message-main');
const API_BASE_URL = 'https://backend-5be9.onrender.com/api'; //  Or your Render URL

// ... (loadPosts function - remains the same) ...
// ... (displayPosts function - SEE CHANGES BELOW) ...

function displayPosts(posts) {
    postList.innerHTML = ''; // Clear existing posts
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // --- Main Container for Content ---
        const contentContainer = document.createElement('div');
        contentContainer.classList.add('post-content');

        // ... (title, author, content - same as before) ...

        // --- Title (NOW CLICKABLE) ---
        const titleElement = document.createElement('h2');
        const titleLink = document.createElement('a'); // Create an <a> tag
        titleLink.href = `post-details.html?id=${post._id}`; // Set the link to the details page
        titleLink.textContent = post.title; // Set the link text to the post title
        titleElement.appendChild(titleLink);   // Wrap the title text in the link
        contentContainer.appendChild(titleElement);

        // --- Author and Date ---
        const authorDateElement = document.createElement('p');
        authorDateElement.textContent = `By: ${post.author.username} on ${formatDate(post.createdAt)}`;
        contentContainer.appendChild(authorDateElement);

        // --- Content ---
        const contentElement = document.createElement('p');
        contentElement.textContent = post.content.substring(0, 250);
        contentContainer.appendChild(contentElement);


        // --- Like/Dislike Buttons ---
        const voteContainer = document.createElement('div');
        voteContainer.classList.add('vote-container');

        const likeButton = document.createElement('button');
        likeButton.classList.add('vote-button', 'like-button');
        likeButton.innerHTML = '&#x25B2;'; // Up arrow
        likeButton.dataset.postId = post._id; // Store post ID as a data attribute
        likeButton.addEventListener('click', () => handleLike(post._id, likeCount)); // Pass likeCount
        voteContainer.appendChild(likeButton);

        const likeCount = document.createElement('span'); // Display like count
        likeCount.classList.add('vote-count');
        likeCount.textContent = post.likes;
        voteContainer.appendChild(likeCount);

        const dislikeButton = document.createElement('button');
        dislikeButton.classList.add('vote-button', 'dislike-button');
        dislikeButton.innerHTML = '&#x25BC;'; // Down arrow
        dislikeButton.dataset.postId = post._id;  //Store post ID
        dislikeButton.addEventListener('click', () => handleDislike(post._id, dislikeCount)); // Pass dislikeCount
        voteContainer.appendChild(dislikeButton);

        const dislikeCount = document.createElement('span');  //Display dislike count
        dislikeCount.classList.add('vote-count');
        dislikeCount.textContent = post.dislikes;
        voteContainer.appendChild(dislikeCount);

        contentContainer.appendChild(voteContainer);



        // --- Image ---
        if (post.imageUrl) {
          const imgContainer = document.createElement('div');
          imgContainer.classList.add('image-container');

          const imgElement = document.createElement('img');
          imgElement.src = post.imageUrl;
          imgElement.alt = post.title;
          imgContainer.appendChild(imgElement);
          contentContainer.appendChild(imgContainer)
        }

        // ... (delete button - same as before) ...
		const currentUserId = localStorage.getItem('userId');
        if (currentUserId && currentUserId === post.author._id.toString()) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', () => {
                deletePost(post._id, postElement);
            });
            contentContainer.appendChild(deleteButton);
        }
        postElement.appendChild(contentContainer);
        postList.appendChild(postElement);

    });
}


// --- Like Handler ---
async function handleLike(postId, likeCountElement) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("You must be logged in to like.")
        return;
    }
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (response.ok) {
          // Update the like count in the UI *using the value from the server*:
          likeCountElement.textContent = data.likes;
      } else {
        alert(`Error: ${data.message}`)
        console.error('Like failed:', data.message);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      alert("An error occurred while liking the post.")
    }
  }
  
  // --- Dislike Handler ---
  async function handleDislike(postId, dislikeCountElement) {
      try {
          const token = localStorage.getItem('token');
          if (!token) {
              alert("You must be logged in to dislike.")
              return;
          }
          const response = await fetch(`${API_BASE_URL}/posts/${postId}/dislike`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          });
  
          const data = await response.json();
  
          if (response.ok) {
              // Update the dislike count in the UI *using the value from the server*
              dislikeCountElement.textContent = data.dislikes;
          } else {
            alert(`Error: ${data.message}`)
            console.error('Dislike failed:', data.message);
          }
      } catch (error) {
          console.error('Error disliking post:', error);
          alert("An error occurred while disliking the post.")
      }
  }
  
  // ... (create post logic - remains the same) ...
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
  // --- CREATE POST FUNCTION (in index.html) ---
  if (createPostFormMain) {
      createPostFormMain.addEventListener('submit', async (e) => {
          e.preventDefault();
  
          const title = document.getElementById('title-main').value;
          const content = document.getElementById('content-main').value;
          const image = document.getElementById('image-main').files[0];
  
          const formData = new FormData();
          formData.append('title', title);
          formData.append('content', content);
          if(image) {
              formData.append('image', image)
          }
  
          try{
              const token = localStorage.getItem('token');
              if (!token) {
                  createPostMessageMain.textContent = "You must be logged in to create a post."
                  createPostMessageMain.style.color = 'red';
                  return; //Stop execution if not logged in.
              }
              const response = await fetch(`${API_BASE_URL}/posts`, { //Use API_BASE_URL
                  method: "POST",
                  headers: {
                      'Authorization': `Bearer ${token}`
                  },
                  body: formData
              });
  
              console.log("Create Post Response:", response); // ADD THIS
  
              const data = await response.json();
  
              console.log("Create Post Data:", data);  //ADD THIS
  
              if (response.ok) {
                  createPostMessageMain.textContent = 'Post created successfully!';
                  createPostMessageMain.style.color = "green";
                  //Reload posts to display the new post.
                  loadPosts();
                  //Clear the form
                  createPostFormMain.reset();
              } else {
                  createPostMessageMain.textContent = data.message;
                  createPostMessageMain.style.color = 'red'
              }
  
          } catch(error) {
              console.error("Create post error:", error);
              createPostMessageMain.textContent = "An error occurred while creating post."
              createPostMessageMain.style.color = 'red';
          }
      })
  }
  function updateHeader() {
      const username = localStorage.getItem('username');
      const userId = localStorage.getItem('userId'); // Get the logged-in user's ID
      const loginLink = document.querySelector('a[href="login.html"]');
      const registerLink = document.querySelector('a[href="register.html"]');
  
      if (username && userId) { // Check for both username *and* userId
           // User is logged in, Create link with username
          const usernameDisplay = document.createElement('span');
          usernameDisplay.id = 'user-info';
  
          const userLink = document.createElement('a'); // Create the link element
          userLink.href = `profile.html?id=${userId}`; // Set the link to profile.html with the user's ID
          userLink.textContent = username; // The username is the link text
  
          usernameDisplay.textContent = 'Logged in as: ';  //Text before link
          usernameDisplay.appendChild(userLink);           // Put link in the span.
  
          if(loginLink) {
              loginLink.style.display = 'none';
          }
          if(registerLink) {
              registerLink.style.display = 'none';
          }
  
          const logoutButton = document.getElementById('logout-button');
          if(logoutButton) {
              logoutButton.style.display = 'inline-block';
          }
  
          // Check if element exists before to appendChild.
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
          if(loginLink) {
              loginLink.style.display = 'inline-block'
           }
          if(registerLink){
             registerLink.style.display = 'inline-block'
          }
          const logoutButton = document.getElementById('logout-button');
          if(logoutButton) {
              logoutButton.style.display = 'none';
          }
      }
  }
  
  // Call checkLoginStatus, loadPosts, and updateHeader on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
      checkLoginStatus();
      updateHeader();
      loadPosts();
  });
  