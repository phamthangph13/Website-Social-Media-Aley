// Post Loader
// Handles loading and rendering of posts

class PostLoader {
    constructor() {
        this.feedElement = document.querySelector('.feed');
        this.loadingElement = document.querySelector('.feed-loading');
    }

    // Load posts from API
    loadPosts() {
        // Show loading state
        if (this.loadingElement) {
            this.loadingElement.style.display = 'flex';
        }
        
        // For demonstration purposes, set a demo token if none exists
        // This ensures users see the "Kết bạn" buttons in the demo
        if (!localStorage.getItem('aley_token')) {
            console.log("Setting demo token for testing 'Kết bạn' buttons");
            localStorage.setItem('aley_token', 'demo_token_for_testing');
            
            // Also set a demo user ID and email to check against post authors
            localStorage.setItem('aley_user_id', 'demo_user_123');
            localStorage.setItem('aley_user_email', 'demo_user@example.com');
            localStorage.setItem('aley_user_name', 'Phạm Thắng Đẹp Trai');
            localStorage.setItem('aley_user_display_name', 'Phạm Thắng Đẹp Trai');
        }
        
        // Check if user is logged in
        const authToken = localStorage.getItem('aley_token');
        const currentUserId = localStorage.getItem('aley_user_id');
        const currentUserEmail = localStorage.getItem('aley_user_email');
        
        // Hide post creation if not logged in
        if (!authToken) {
            const createPostCard = document.querySelector('.create-post-card');
            if (createPostCard) {
                createPostCard.style.display = 'none';
            }
        }
        
        // Determine which API function to call
        const apiFunction = authToken ? 
            apiService.posts.getFeed() : 
            apiService.posts.getPosts();
        
        // Call API and process results
        apiFunction
            .then(response => {
                // Hide loading
                if (this.loadingElement) {
                    this.loadingElement.style.display = 'none';
                }
                
                // Clear current feed content
                this.feedElement.innerHTML = '';
                this.feedElement.appendChild(this.loadingElement);
                
                if (response.data && response.data.posts && response.data.posts.length > 0) {
                    // Add posts from API to feed
                    // Filter posts in home page (show public and friends posts, and own private posts)
                    const visiblePosts = response.data.posts.filter(post => 
                        post.privacy === 'public' || 
                        post.privacy === 'friends' || 
                        post.is_own_post === true
                    );
                    
                    if (visiblePosts.length > 0) {
                        // For demonstration purposes, mark some posts as from friends
                        // and others as from non-friends (to show the friend button)
                        visiblePosts.forEach((post, index) => {
                            // For demo purposes, set a post created by the current user 
                            if (index === 0) {
                                // This is a post by the current user
                                post.is_own_post = true;
                                post.author.id = localStorage.getItem('aley_user_id');
                                post.author.email = localStorage.getItem('aley_user_email');
                                post.author.name = localStorage.getItem('aley_user_name') || 'Phạm Thắng Đẹp Trai';
                            } 
                            // Process all other posts
                            else {
                                // Check if this post belongs to the current user
                                const currentUserId = localStorage.getItem('aley_user_id');
                                const currentUserEmail = localStorage.getItem('aley_user_email');
                                const currentUserName = localStorage.getItem('aley_user_name');
                                const authorId = post.author.id || post.author.user_id || post.author._id;
                                const authorName = post.author.name;
                                
                                // Check if author name matches or contains the current user's name
                                const nameMatches = currentUserName && authorName && 
                                    (authorName === currentUserName || 
                                     authorName.includes(currentUserName) || 
                                     currentUserName.includes(authorName));
                                
                                // Check if this is the current user's post
                                const isUserPost = 
                                    post.is_own_post === true ||
                                    (currentUserId && authorId === currentUserId) || 
                                    (currentUserEmail && post.author.email === currentUserEmail) ||
                                    nameMatches;
                                
                                if (isUserPost) {
                                    // This is the current user's post
                                    post.is_own_post = true;
                                    
                                    // Ensure consistent author information
                                    if (!post.author.id) post.author.id = currentUserId;
                                    if (!post.author.email) post.author.email = currentUserEmail;
                                    if (!post.author.name) post.author.name = currentUserName;
                                } else {
                                    // This is another user's post - explicitly mark it as not own post
                                    post.is_own_post = false;
                                    
                                    // Additional checks by comparing author information with current user
                                    if (!post.is_own_post && post.author) {
                                        const authorId = post.author.id || post.author.user_id || post.author._id;
                                        const authorName = post.author.name;
                                        
                                        post.is_own_post = 
                                            // Check by ID
                                            (currentUserId && authorId && authorId === currentUserId) ||
                                            // Check by email
                                            (currentUserEmail && post.author.email && post.author.email === currentUserEmail) ||
                                            // Check by name
                                            (currentUserName && authorName && 
                                                (authorName === currentUserName || 
                                                 authorName.includes(currentUserName) ||
                                                 currentUserName.includes(authorName)));
                                    }
                                }
                            }
                            
                            const postElement = this.createPostElement(post);
                            this.feedElement.appendChild(postElement);
                        });
                        
                        // Set up the friend request buttons for new posts
                        if (typeof setupFriendRequestButtons === 'function') {
                            setupFriendRequestButtons();
                        }
                    } else {
                        // Show empty state if no visible posts
                        this.showEmptyState();
                    }
                } else {
                    // Show empty state
                    this.showEmptyState();
                }
            })
            .catch(error => {
                // Hide loading
                if (this.loadingElement) {
                    this.loadingElement.style.display = 'none';
                }
                
                // Show error message
                console.error('Cannot load posts:', error);
                this.showErrorState();
            });
    }

    // Show empty state when no posts
    showEmptyState() {
        const noPostsElement = document.createElement('div');
        noPostsElement.className = 'no-posts-message';
        noPostsElement.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper fa-3x"></i>
                <h3>Chưa có bài viết nào</h3>
                <p>Hãy theo dõi thêm bạn bè hoặc đăng bài viết đầu tiên của bạn.</p>
            </div>
        `;
        this.feedElement.appendChild(noPostsElement);
    }

    // Show error state
    showErrorState() {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3>Không thể tải bài viết</h3>
                <p>Đã xảy ra lỗi khi tải bài viết. Vui lòng thử lại sau.</p>
                <button class="retry-btn">Thử lại</button>
            </div>
        `;
        this.feedElement.appendChild(errorElement);
        
        // Add event listener for retry button
        const retryButton = errorElement.querySelector('.retry-btn');
        if (retryButton) {
            retryButton.addEventListener('click', () => this.loadPosts());
        }
    }

    // Create post element from data
    createPostElement(post) {
        const postElement = document.createElement('div');
        postElement.className = 'post-card card animate__animated animate__fadeIn';
        postElement.dataset.postId = post.post_id;
        
        // Create HTML for media section
        const mediaHTML = this.generateMediaHTML(post);
        
        // Create HTML for emotion
        let emotionHTML = '';
        if (post.emotion) {
            emotionHTML = `<span class="post-emotion">- đang cảm thấy ${post.emotion.emoji} ${post.emotion.name}</span>`;
        }
        
        // Create HTML for location
        let locationHTML = '';
        if (post.location) {
            locationHTML = `<span class="post-location">tại <i class="fas fa-map-marker-alt"></i> ${post.location}</span>`;
        }
        
        // Format date and time
        const postDate = new Date(post.created_at);
        const formattedDate = postDate.toLocaleString('vi-VN');
        
        // Format post content with hashtag highlighting
        const formattedContent = window.hashtagFormatter ? 
            window.hashtagFormatter.formatTextWithHashtags(post.content || '') : 
            (post.content || '');
        
        // Create HTML for privacy label
        let privacyLabel = '';
        if (post.privacy === 'private') {
            privacyLabel = '<span class="privacy-label private"><i class="fas fa-lock"></i> Riêng tư</span>';
        } else if (post.privacy === 'friends') {
            privacyLabel = '<span class="privacy-label friends"><i class="fas fa-user-friends"></i> Bạn bè</span>';
        } else {
            privacyLabel = '<span class="privacy-label public"><i class="fas fa-globe-asia"></i> Công khai</span>';
        }
        
        // Determine if we should show the "Kết bạn" (Add Friend) button
        // Show it if: 
        // 1. This is not the user's own post
        // 2. The user is not already friends with the author (is_friend is not true)
        // 3. User is logged in (determined by the auth token)
        const isLoggedIn = !!localStorage.getItem('aley_token');
        
        // Get current user ID, email, and name from localStorage
        const currentUserId = localStorage.getItem('aley_user_id');
        const currentUserEmail = localStorage.getItem('aley_user_email');
        const currentUserName = localStorage.getItem('aley_user_name');
        
        // Check if this is user's own post - either by is_own_post flag or by comparing identity
        let isUserOwnPost = post.is_own_post === true;
        
        // Additional checks by comparing author information with current user
        if (!isUserOwnPost && post.author) {
            const authorId = post.author.id || post.author.user_id || post.author._id;
            const authorName = post.author.name;
            
            isUserOwnPost = 
                // Check by ID
                (currentUserId && authorId && authorId === currentUserId) ||
                // Check by email
                (currentUserEmail && post.author.email && post.author.email === currentUserEmail) ||
                // Check by name
                (currentUserName && authorName && 
                    (authorName === currentUserName || 
                     authorName.includes(currentUserName) ||
                     currentUserName.includes(authorName)));
        }
        
        const isNotOwnPost = !isUserOwnPost;
        
        // Cho phép hiển thị nút kết bạn với tất cả bài viết không thuộc về người dùng hiện tại
        // Trạng thái kết bạn thực tế sẽ được kiểm tra bởi post-interactions.js
        // thông qua gọi API checkFriendshipStatus
        const isNotFriend = true;
        
        // Log for debugging
        console.log(`Post ${post.post_id}:`, {
            authorName: post.author.name,
            currentUserName: currentUserName,
            nameCheck: currentUserName && post.author.name && 
                      (post.author.name === currentUserName || 
                       post.author.name.includes(currentUserName) || 
                       currentUserName.includes(post.author.name)),
            authorId: post.author.id || post.author.user_id || post.author._id,
            currentUserId: currentUserId,
            authorEmail: post.author.email,
            currentUserEmail: currentUserEmail,
            isLoggedIn: isLoggedIn,
            isNotOwnPost: isNotOwnPost,
            isUserOwnPost: isUserOwnPost,
            originalIsOwnPost: post.is_own_post,
            shouldShowButton: isLoggedIn && isNotOwnPost
        });
        
        // Generate Add Friend button HTML
        let addFriendHTML = '';
        if (isLoggedIn && isNotOwnPost) {
            // Lấy user_id từ post.author
            const authorId = post.author.id || post.author.user_id || post.author._id || `user_${post.post_id}`;
            
            addFriendHTML = `
                <button class="add-friend-btn" data-user-id="${authorId}" title="Kết bạn với ${post.author.name}">
                    <i class="fas fa-user-plus"></i>
                    <span>Kết bạn</span>
                </button>
            `;
        }
        
        // Create HTML for post
        postElement.innerHTML = `
            <div class="card-header post-header">
                <div class="post-author">
                    <div class="avatar">
                        <img src="${this.getAvatarUrl(post.author.avatar)}" alt="Avatar">
                    </div>
                    <div class="author-info">
                        <h4>
                            ${post.author.name} 
                            ${isUserOwnPost ? '<span class="user-label">(Bạn)</span>' : ''}
                        </h4>
                        <p>${formattedDate} ${privacyLabel}</p>
                    </div>
                    ${addFriendHTML}
                </div>
                <div class="post-options">
                    <i class="fas fa-ellipsis-h"></i>
                    <div class="post-options-dropdown">
                        <!-- Options will be dynamically populated -->
                    </div>
                </div>
            </div>
            <div class="card-body post-content">
                <p>${formattedContent} ${emotionHTML} ${locationHTML}</p>
                ${mediaHTML}
            </div>
            <div class="card-footer post-footer">
                <div class="post-stats">
                    <div class="likes">
                        <i class="fas fa-heart"></i>
                        <span>${post.likes_count}</span>
                    </div>
                    <div class="comments">
                        <i class="fas fa-comment"></i>
                        <span>${post.comments_count}</span>
                    </div>
                    <div class="shares">
                        <i class="fas fa-share"></i>
                        <span>${post.shares_count}</span>
                    </div>
                </div>
                <div class="post-actions">
                    <button class="action-btn ${post.is_liked ? 'liked' : ''}">
                        <i class="${post.is_liked ? 'fas' : 'far'} fa-heart"></i>
                        <span>Thích</span>
                    </button>
                    <button class="action-btn">
                        <i class="far fa-comment"></i>
                        <span>Bình luận</span>
                    </button>
                    <button class="action-btn">
                        <i class="far fa-share-square"></i>
                        <span>Chia sẻ</span>
                    </button>
                </div>
            </div>
        `;
        
        // Set up event handlers
        const likeButton = postElement.querySelector('.action-btn:nth-child(1)');
        postInteractions.setupLikeButton(likeButton, post.post_id);
        
        // Set up post options
        postOptions.setupPostOptions(postElement, post);
        
        // Set up media handlers
        this.setupMediaHandlers(postElement);
        
        return postElement;
    }

    // Generate HTML for media content
    generateMediaHTML(post) {
        let mediaHTML = '';
        if (post.media && post.media.length > 0) {
            const mediaCount = post.media.length;
            
            if (mediaCount === 1) {
                // If there's only 1 media file
                const media = post.media[0];
                if (media.type === 'image') {
                    mediaHTML = `<div class="post-media"><img src="${media.url}" alt=""></div>`;
                } else if (media.type === 'video') {
                    mediaHTML = `<div class="post-media"><video src="${media.url}" controls poster="${media.thumbnail}"></video></div>`;
                }
            } else {
                // If there are multiple media files
                mediaHTML = `<div class="post-media grid-media count-${Math.min(mediaCount, 6)}">`;
                
                // Limit display to max 6 files
                const displayCount = Math.min(mediaCount, 6);
                for (let i = 0; i < displayCount; i++) {
                    const media = post.media[i];
                    if (media.type === 'image') {
                        // If it's the last image and there are more not shown
                        if (i === displayCount - 1 && mediaCount > displayCount) {
                            mediaHTML += `
                                <div class="media-item">
                                    <img src="${media.url}" alt="">
                                    <div class="more-media-overlay">+${mediaCount - displayCount + 1}</div>
                                </div>
                            `;
                        } else {
                            mediaHTML += `<img src="${media.url}" alt="">`;
                        }
                    } else if (media.type === 'video') {
                        // If it's the last video and there are more files not shown
                        if (i === displayCount - 1 && mediaCount > displayCount) {
                            mediaHTML += `
                                <div class="video-container">
                                    <video src="${media.url}" poster="${media.thumbnail}"></video>
                                    <div class="video-play-button"><i class="fas fa-play"></i></div>
                                    <div class="more-media-overlay">+${mediaCount - displayCount + 1}</div>
                                </div>
                            `;
                        } else {
                            mediaHTML += `
                                <div class="video-container">
                                    <video src="${media.url}" poster="${media.thumbnail}"></video>
                                    <div class="video-play-button"><i class="fas fa-play"></i></div>
                                </div>
                            `;
                        }
                    }
                }
                mediaHTML += '</div>';
            }
        }
        return mediaHTML;
    }

    // Set up handlers for media elements
    setupMediaHandlers(postElement) {
        // Set up events for video play buttons
        const playButtons = postElement.querySelectorAll('.video-play-button');
        playButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const videoContainer = this.closest('.video-container');
                const video = videoContainer.querySelector('video');
                if (video) {
                    if (video.paused) {
                        video.play();
                        this.style.display = 'none';
                    } else {
                        video.pause();
                        this.style.display = 'flex';
                    }
                }
            });
        });
        
        // Set up events for "view more" overlays
        const moreOverlays = postElement.querySelectorAll('.more-media-overlay');
        moreOverlays.forEach(overlay => {
            overlay.addEventListener('click', function() {
                // Open modal to view all media (can be implemented later)
                alert('Mở chế độ xem đầy đủ hình ảnh và video');
            });
        });
        
        // Set up events for videos
        const videos = postElement.querySelectorAll('video');
        videos.forEach(video => {
            video.addEventListener('play', function() {
                const playButton = this.parentElement.querySelector('.video-play-button');
                if (playButton) {
                    playButton.style.display = 'none';
                }
            });
            
            video.addEventListener('pause', function() {
                const playButton = this.parentElement.querySelector('.video-play-button');
                if (playButton) {
                    playButton.style.display = 'flex';
                }
            });
            
            video.addEventListener('ended', function() {
                const playButton = this.parentElement.querySelector('.video-play-button');
                if (playButton) {
                    playButton.style.display = 'flex';
                }
            });
        });
    }

    // Hàm để xử lý avatar có thể là URL hoặc ID MongoDB
    getAvatarUrl(avatar) {
        if (!avatar) {
            return 'https://i.pravatar.cc/150?img=1'; // Avatar mặc định
        }
        
        // Kiểm tra nếu avatar là URL (bắt đầu bằng http://, https://, hoặc blob:)
        if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('blob:')) {
            return avatar;
        } else {
            // Nếu không phải URL, giả định đây là image_id và tạo URL đến API
            return `${apiService.baseUrl || 'http://localhost:5000/api'}/users/image/${avatar}`;
        }
    }
}

// Create a global instance
const postLoader = new PostLoader();

// Export for use in other modules
window.postLoader = postLoader; 