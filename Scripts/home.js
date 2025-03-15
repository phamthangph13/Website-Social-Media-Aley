// Home Page Initialization
// Main entry point for the home page

document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const feedElement = document.querySelector('.feed');
    const loadingElement = document.querySelector('.feed-loading');
    const postLoadingOverlay = document.querySelector('.post-loading-overlay');
    const postLoadingProgressBar = document.querySelector('.post-loading-progress-bar');
    
    // Initialize user avatar management
    userAvatarManager.initialize();
    
    // Load posts from API
    postLoader.loadPosts();
    
    // Set up event for post button in the post creator
    const postBtn = document.querySelector('.post-btn');
    if (postBtn) {
        postBtn.addEventListener('click', function() {
            // Get post content
            const postContent = document.querySelector('.post-input textarea').value;
            if (!postContent.trim()) {
                alert('Vui lòng nhập nội dung bài viết!');
                return;
            }
            
            // Show loading overlay
            showPostLoading();
            
            // Prepare post data
            const postData = {
                content: postContent,
                privacy: 'public' // Default to public
            };
            
            // Simulate upload progress (replace with actual API in production)
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 5;
                if (progress <= 100) {
                    updateProgressBar(progress);
                } else {
                    clearInterval(progressInterval);
                    
                    // After completion, hide loading and refresh posts
                    setTimeout(() => {
                        hidePostLoading();
                        
                        // Add new post to the top of feed if successful
                        AleyAPI.User.getCurrentUser()
                            .then(userData => {
                                // Get user ID from API response or localStorage
                                const userId = userData.user_id || userData.id || localStorage.getItem('aley_user_id');
                                const userEmail = userData.email || localStorage.getItem('aley_user_email');
                                
                                // Create mock post object (normally would come from API)
                                const mockPost = {
                                    post_id: 'temp_' + Date.now(),
                                    content: postContent,
                                    created_at: new Date().toISOString(),
                                    author: {
                                        id: userId,
                                        user_id: userId,
                                        _id: userId,
                                        name: userData.fullName || localStorage.getItem('aley_user_name') || 'Người dùng Aley',
                                        avatar: userData.avatar || localStorage.getItem('aley_user_avatar') || 'https://i.pravatar.cc/150?img=12',
                                        email: userEmail
                                    },
                                    media: [],
                                    likes_count: 0,
                                    comments_count: 0,
                                    shares_count: 0,
                                    privacy: 'public',
                                    is_liked: false,
                                    is_own_post: true // Mark as user's own post
                                };
                                
                                console.log('Created new post with author:', mockPost.author);
                                
                                // Create post element and add to the top of feed
                                const postElement = postLoader.createPostElement(mockPost);
                                feedElement.insertBefore(postElement, feedElement.firstChild);
                                
                                // Clear textarea after posting
                                document.querySelector('.post-input textarea').value = '';
                            })
                            .catch(error => {
                                console.error('Cannot get user info:', error);
                                // Clear textarea after posting
                                document.querySelector('.post-input textarea').value = '';
                            });
                    }, 500);
                }
            }, 200);
            
            // In production, you would call the API here instead of the simulation
            // apiService.posts.createPost(postData, updateProgressBar)
            //     .then(response => {
            //         hidePostLoading();
            //         document.querySelector('.post-input textarea').value = '';
            //         // Add new post to the top of feed
            //         const postElement = postLoader.createPostElement(response.data);
            //         feedElement.insertBefore(postElement, feedElement.firstChild);
            //     })
            //     .catch(error => {
            //         hidePostLoading();
            //         alert('Failed to post: ' + error.message);
            //     });
        });
    }
    
    // Show loading when posting
    function showPostLoading() {
        postLoadingOverlay.classList.add('active');
        updateProgressBar(0);
    }
    
    // Hide loading after posting
    function hidePostLoading() {
        postLoadingOverlay.classList.remove('active');
    }
    
    // Update progress bar
    function updateProgressBar(percent) {
        postLoadingProgressBar.style.width = percent + '%';
    }
    
    // Set up privacy selector in post creator
    setupPrivacySelector();
    
    // Set up privacy selector
    function setupPrivacySelector() {
        const privacyBtn = document.querySelector('.privacy-btn');
        const privacyDropdown = document.querySelector('.privacy-dropdown');
        const privacyOptions = document.querySelectorAll('.privacy-option');
        const privacyText = document.querySelector('.privacy-text');
        const privacyIcon = document.querySelector('.privacy-btn i:first-child');
        
        if (!privacyBtn || !privacyDropdown || !privacyOptions.length) return;
        
        // Toggle privacy dropdown
        privacyBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            privacyDropdown.classList.toggle('show');
        });
        
        // Set privacy option when selected
        privacyOptions.forEach(option => {
            option.addEventListener('click', function() {
                const privacy = this.dataset.privacy;
                const privacyName = this.querySelector('.privacy-name').textContent;
                const privacyIconClass = this.querySelector('i').className;
                
                // Update button text and icon
                privacyText.textContent = privacyName;
                privacyIcon.className = privacyIconClass;
                
                // Hide dropdown
                privacyDropdown.classList.remove('show');
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.privacy-selector') && privacyDropdown.classList.contains('show')) {
                privacyDropdown.classList.remove('show');
            }
        });
    }
}); 