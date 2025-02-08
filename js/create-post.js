// frontend/js/create-post.js
const createPostForm = document.getElementById('create-post-form');
const createPostMessage = document.getElementById('create-post-message');
const API_BASE_URL = 'http://localhost:5000/api'; // Or your Render backend URL

if (createPostForm) { //Important ,check if the element exists!
    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const image = document.getElementById('image').files[0]; // Get the file

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (image) {
          formData.append('image', image);
        }


        try {
            const token = localStorage.getItem('token'); // Get the token
            if (!token) {
                createPostMessage.textContent = 'You must be logged in to create a post.';
                createPostMessage.style.color = 'red';
                return; // Stop execution if not logged in
            }

            const response = await fetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
                    // Don't set Content-Type for FormData, the browser does it automatically
                },
                body: formData, // Send FormData
            });

            const data = await response.json();

            if (response.ok) {
                createPostMessage.textContent = 'Post created successfully!';
                createPostMessage.style.color = 'green';
                // Redirect to the main page after a delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                // Or, clear the form:  createPostForm.reset();
            } else {
                createPostMessage.textContent = data.message;
                 createPostMessage.style.color = 'red';
            }

        } catch (error) {
            console.error('Error creating post:', error);
             createPostMessage.textContent = 'An error occurred while create post.';
             createPostMessage.style.color = 'red';
        }
    });
}