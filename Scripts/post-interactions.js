// Post Interactions
// Handles likes, comments, and shares for posts

class PostInteractions {
    // Set up like button functionality
    setupLikeButton(likeButton, postId) {
        likeButton.addEventListener('click', function() {
            this.classList.toggle('liked');
            const icon = this.querySelector('i');
            const likeCountElement = this.closest('.post-footer').querySelector('.likes span');
            let likeCount = parseInt(likeCountElement.textContent);
            
            if (this.classList.contains('liked')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                likeCountElement.textContent = likeCount + 1;
                
                // Heart bouncing animation
                icon.classList.add('animate__animated', 'animate__heartBeat');
                setTimeout(() => {
                    icon.classList.remove('animate__animated', 'animate__heartBeat');
                }, 1000);
                
                // Call API to like post if apiService exists
                if (typeof apiService !== 'undefined' && apiService.posts) {
                    apiService.posts.toggleLike(postId)
                        .catch(error => {
                            console.error('Error liking post:', error);
                            this.classList.remove('liked');
                            icon.classList.remove('fas');
                            icon.classList.add('far');
                            likeCountElement.textContent = likeCount;
                        });
                }
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                likeCountElement.textContent = Math.max(0, likeCount - 1);
                
                // Call API to unlike post if apiService exists
                if (typeof apiService !== 'undefined' && apiService.posts) {
                    apiService.posts.toggleLike(postId)
                        .catch(error => {
                            console.error('Error unliking post:', error);
                            this.classList.add('liked');
                            icon.classList.remove('far');
                            icon.classList.add('fas');
                            likeCountElement.textContent = likeCount;
                        });
                }
            }
        });
    }

    // Set up comment functionality
    setupCommentButton(commentButton, postId) {
        commentButton.addEventListener('click', function() {
            // Placeholder for comment functionality
            console.log('Comment button clicked for post:', postId);
            
            // Get or create comment section
            const postCard = this.closest('.post-card');
            let commentSection = postCard.querySelector('.comment-section');
            
            if (!commentSection) {
                commentSection = document.createElement('div');
                commentSection.className = 'comment-section';
                commentSection.innerHTML = `
                    <div class="comment-input">
                        <div class="avatar">
                            <img src="${localStorage.getItem('aley_user_avatar') || '../assets/images/default-avatar.png'}" alt="Avatar">
                        </div>
                        <div class="input-container">
                            <textarea placeholder="Viết bình luận..."></textarea>
                            <button class="send-comment"><i class="fas fa-paper-plane"></i></button>
                        </div>
                    </div>
                    <div class="comment-list">
                        <!-- Comments will be loaded here -->
                    </div>
                `;
                
                // Insert comment section before footer
                const postFooter = postCard.querySelector('.post-footer');
                postCard.insertBefore(commentSection, postFooter.nextSibling);
                
                // Focus on textarea
                setTimeout(() => {
                    commentSection.querySelector('textarea').focus();
                }, 100);
                
                // Set up send comment button
                const sendCommentBtn = commentSection.querySelector('.send-comment');
                sendCommentBtn.addEventListener('click', () => {
                    const textarea = commentSection.querySelector('textarea');
                    const commentText = textarea.value.trim();
                    
                    if (commentText) {
                        this.addComment(postId, commentText, commentSection);
                        textarea.value = '';
                    }
                });
                
                // Allow pressing Enter to send comment
                const textarea = commentSection.querySelector('textarea');
                textarea.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const commentText = textarea.value.trim();
                        
                        if (commentText) {
                            this.addComment(postId, commentText, commentSection);
                            textarea.value = '';
                        }
                    }
                });
            } else {
                // Toggle comment section visibility
                commentSection.style.display = commentSection.style.display === 'none' ? 'block' : 'none';
                
                if (commentSection.style.display === 'block') {
                    // Focus on textarea when showing
                    setTimeout(() => {
                        commentSection.querySelector('textarea').focus();
                    }, 100);
                }
            }
        }.bind(this));
    }

    // Add a new comment
    addComment(postId, commentText, commentSection) {
        // Get current user info
        const userName = localStorage.getItem('aley_user_name') || 'Người dùng Aley';
        const userAvatar = localStorage.getItem('aley_user_avatar') || '../assets/images/default-avatar.png';
        
        // Create comment element
        const commentElement = document.createElement('div');
        commentElement.className = 'comment-item animate__animated animate__fadeIn';
        commentElement.innerHTML = `
            <div class="avatar">
                <img src="${userAvatar}" alt="Avatar">
            </div>
            <div class="comment-content">
                <div class="comment-author">${userName}</div>
                <div class="comment-text">${commentText}</div>
                <div class="comment-actions">
                    <span class="like-comment">Thích</span>
                    <span class="reply-comment">Trả lời</span>
                    <span class="comment-time">Vừa xong</span>
                </div>
            </div>
        `;
        
        // Add to comment list
        const commentList = commentSection.querySelector('.comment-list');
        commentList.insertBefore(commentElement, commentList.firstChild);
        
        // Update comment count
        const commentCountElement = commentSection.closest('.post-card').querySelector('.comments span');
        const commentCount = parseInt(commentCountElement.textContent);
        commentCountElement.textContent = commentCount + 1;
        
        // Call API to add comment if apiService exists
        if (typeof apiService !== 'undefined' && apiService.comments) {
            apiService.comments.addComment(postId, commentText)
                .then(response => {
                    console.log('Comment added successfully:', response);
                })
                .catch(error => {
                    console.error('Error adding comment:', error);
                });
        }
    }

    // Set up share functionality
    setupShareButton(shareButton, postId) {
        shareButton.addEventListener('click', function() {
            // Placeholder for share functionality
            alert('Tính năng chia sẻ bài viết đang được phát triển');
        });
    }
}

// Create global instance
const postInteractions = new PostInteractions();

// Export for use in other modules
window.postInteractions = postInteractions; 