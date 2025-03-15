/**
 * Profile Handler
 * Fetches and displays user profile data using the Aley API
 */

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check if we're viewing our own profile or someone else's
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        
        let userData;
        
        if (userId) {
            // If userId is provided in URL, fetch that specific user's profile
            userData = await AleyAPI.User.getUserById(userId);
            // Hide edit profile button if viewing someone else's profile
            const editProfileBtn = document.querySelector('.primary-btn');
            if (editProfileBtn) {
                editProfileBtn.style.display = 'none';
            }
        } else {
            // Otherwise fetch current user's profile (requires authentication)
            userData = await AleyAPI.User.getCurrentUser();
        }
        
        // Update profile UI with fetched data
        updateProfileUI(userData);
        
    } catch (error) {
        console.error('Failed to load profile data:', error);
        showErrorMessage('Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.');
    }
});

/**
 * Updates the profile UI with user data
 * @param {Object} userData - The user data object from API
 */
function updateProfileUI(userData) {
    
    
    // Update profile name and verified status
    const profileNameElement = document.querySelector('.profile-name h1');
    if (profileNameElement) {
        profileNameElement.textContent = userData.fullName || 'Người dùng Aley';
    }
    
    // Update verified badge visibility
    const verifiedBadge = document.querySelector('.verified-badge');
    if (verifiedBadge) {
        verifiedBadge.style.display = userData.verifiedTick ? 'inline-flex' : 'none';
    }
    
    // Update profile avatar
    const avatarImages = document.querySelectorAll('.profile-avatar img, .post-author img');
    const defaultAvatar = 'https://i.pravatar.cc/150?img=1'; // Default fallback avatar
    avatarImages.forEach(img => {
        img.src = userData.avatar || defaultAvatar;
        img.alt = `${userData.fullName}'s avatar`;
    });
    
    // Update profile cover/background image
    const coverImage = document.querySelector('.profile-cover img');
    const defaultCover = 'https://marketplace.canva.com/EAF3xGNlNSc/2/0/1600w/canva-xanh-l%C3%A1-v%C3%A0ng-phong-c%E1%BA%A3nh-c%C3%A2u-l%E1%BA%A1c-b%E1%BB%99-du-l%E1%BB%8Bch-%E1%BA%A3nh-b%C3%ACa-nh%C3%B3m-facebook-DqKwLtooIqU.jpg';
    if (coverImage) {
        coverImage.src = userData.background || defaultCover;
        coverImage.alt = `${userData.fullName}'s cover photo`;
    }
    
    // Update the author name in posts if it exists
    const postAuthorNames = document.querySelectorAll('.author-info h4');
    postAuthorNames.forEach(name => {
        name.textContent = userData.fullName || 'Người dùng Aley';
    });
    
    const bioElement = document.querySelector('.profile-bio');
    if (bioElement) {
        bioElement.textContent = userData['profile-bio'] || 'Chưa có thông tin giới thiệu';
    } 
}

/**
 * Shows an error message to the user
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.backgroundColor = '#f8d7da';
    errorDiv.style.color = '#721c24';
    errorDiv.style.padding = '12px';
    errorDiv.style.marginBottom = '15px';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.textAlign = 'center';
    errorDiv.textContent = message;
    
    // Insert at the top of the profile content
    const profileContent = document.querySelector('.profile-content');
    if (profileContent) {
        profileContent.prepend(errorDiv);
    } else {
        // Fallback to add to body if profile content is not found
        document.body.prepend(errorDiv);
    }
    
    // Remove the message after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Add event listener for edit profile button
document.addEventListener('DOMContentLoaded', function() {
    const editProfileBtn = document.querySelector('.primary-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            // Redirect to profile edit page or show profile edit modal
            // Example: window.location.href = 'edit-profile.html';
            alert('Chức năng chỉnh sửa hồ sơ đang được phát triển');
        });
    }
    
    // Add event listeners for cover photo and avatar update buttons
    const editCoverBtn = document.querySelector('.edit-cover-btn');
    if (editCoverBtn) {
        editCoverBtn.addEventListener('click', function() {
            handleImageUpload('background');
        });
    }
    
    const editAvatarBtn = document.querySelector('.edit-avatar-btn');
    if (editAvatarBtn) {
        editAvatarBtn.addEventListener('click', function() {
            handleImageUpload('avatar');
        });
    }
});

/**
 * Handles image upload for avatar or background
 * @param {string} type - Either 'avatar' or 'background'
 */
function handleImageUpload(type) {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Trigger click on the file input
    fileInput.click();
    
    // Handle file selection
    fileInput.addEventListener('change', async function() {
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            
            // Here you would typically:
            // 1. Upload the file to your server or cloud storage
            // 2. Get back a URL for the uploaded image
            // 3. Update the user profile with the new URL
            
            // For this example, we'll create a temporary URL and show it
            const imageUrl = URL.createObjectURL(file);
            
            // Update UI temporarily
            if (type === 'avatar') {
                const avatarImages = document.querySelectorAll('.profile-avatar img');
                avatarImages.forEach(img => img.src = imageUrl);
            } else if (type === 'background') {
                const coverImage = document.querySelector('.profile-cover img');
                if (coverImage) coverImage.src = imageUrl;
            }
            
            // Simulate API call for update
            try {
                alert(`Đang tải lên ${type === 'avatar' ? 'ảnh đại diện' : 'ảnh bìa'} mới...`);
                
                // In a real implementation, you would:
                // 1. Upload the image file to your server
                // 2. Get back the URL
                // 3. Update the user profile with:
                const updateData = {};
                updateData[type] = imageUrl;
                await AleyAPI.User.updateProfile(updateData);
                
            } catch (error) {
                console.error('Error updating profile image:', error);
                showErrorMessage(`Không thể cập nhật ${type === 'avatar' ? 'ảnh đại diện' : 'ảnh bìa'}. Vui lòng thử lại sau.`);
            }
            
            // Clean up
            document.body.removeChild(fileInput);
        }
    });
} 