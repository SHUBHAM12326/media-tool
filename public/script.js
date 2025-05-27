const handleSubmit = (formId, endpoint) => {
  const form = document.getElementById(formId);
  const submitButton = form.querySelector('button[type="submit"]');
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-spinner';
  loadingIndicator.innerHTML = 'Loading...'; // You can replace this with an actual spinner icon
  loadingIndicator.style.display = 'none'; // Initially hidden
  form.appendChild(loadingIndicator);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(form);
    
    // Show loading indicator and disable the submit button
    loadingIndicator.style.display = 'block';
    submitButton.disabled = true;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output';
        a.click();

        // Show success message
        showMessage('File downloaded successfully!', 'success');
      } else {
        const errorText = await res.text();
        showMessage(`Error: ${errorText}`, 'error');
      }
    } catch (error) {
      showMessage('Something went wrong! Please try again.', 'error');
    } finally {
      // Hide loading indicator and enable the submit button
      loadingIndicator.style.display = 'none';
      submitButton.disabled = false;
    }
  });
};

const showMessage = (message, type) => {
  const messageBox = document.createElement('div');
  messageBox.className = `message ${type}`;
  messageBox.innerText = message;
  document.body.appendChild(messageBox);

  // Add animation
  messageBox.style.opacity = 0;
  setTimeout(() => {
    messageBox.style.opacity = 1;
  }, 10);

  // Remove message after 3 seconds
  setTimeout(() => {
    messageBox.style.opacity = 0;
    setTimeout(() => {
      messageBox.remove();
    }, 300);
  }, 3000);
};

// CSS for loading spinner and messages
const style = document.createElement('style');
style.innerHTML = `
  .loading-spinner {
    margin-top: 10px;
    font-size: 1rem;
    color: #2980b9;
    animation: fadeIn 0.5s;
  }

  .message {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 1000;
    transition: opacity 0.3s ease;
  }

  .message.success {
    background-color: #2ecc71;
    color: white;
  }

  .message.error {
    background-color: #e74c3c;
    color: white;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
document.head.appendChild(style);

// Initialize form handlers
handleSubmit('video-to-audio', '/convert-video');
handleSubmit('cut-audio', '/cut-audio');
handleSubmit('cut-video', '/cut-video');
