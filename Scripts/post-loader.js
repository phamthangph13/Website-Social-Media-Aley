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
        
        // Check if user is logged in
        const authToken = localStorage.getItem('aley_token');
        
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
                    response.data.posts.forEach(post => {
                        const postElement = this.createPostElement(post);
                        this.feedElement.appendChild(postElement);
                    });
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
        
        // Create HTML for post
        postElement.innerHTML = `
            <div class="card-header post-header">
                <div class="post-author">
                    <div class="avatar">
                        <img src="${post.author.avatar}" alt="Avatar">
                    </div>
                    <div class="author-info">
                        <h4>${post.author.name}</h4>
                        <p>${formattedDate} ${post.privacy !== 'public' ? `<i class="fas fa-${post.privacy === 'private' ? 'lock' : 'user-friends'}"></i>` : ''}</p>
                    </div>
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
}

// Create a global instance
const postLoader = new PostLoader();

// Export for use in other modules
window.postLoader = postLoader; 