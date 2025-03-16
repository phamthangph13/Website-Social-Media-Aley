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

// Handle friend request functionality
function setupFriendRequestButtons() {
    console.log("Setting up friend request buttons...");
    
    // Nếu đang chạy thiết lập, bỏ qua để tránh nhiều lệnh gọi cùng lúc
    if (window.isSettingUpFriendButtons) {
        console.log('Already setting up friend buttons, skipping');
        return;
    }
    
    window.isSettingUpFriendButtons = true;
    
    // Find all add friend buttons in the document
    const addFriendButtons = document.querySelectorAll('.add-friend-btn');
    console.log(`Found ${addFriendButtons.length} add friend buttons`);
    
    // Đếm số lượng nút cần kiểm tra trạng thái
    let checkCount = 0;
    let completedChecks = 0;
    
    // Hàm để thông báo khi tất cả các kiểm tra hoàn tất
    const checkComplete = () => {
        completedChecks++;
        if (completedChecks >= checkCount) {
            console.log(`All ${completedChecks} friend status checks completed`);
            window.isSettingUpFriendButtons = false;
        }
    };
    
    // Nếu không tìm thấy nút nào, cho phép thiết lập lại
    if (addFriendButtons.length === 0) {
        window.isSettingUpFriendButtons = false;
        return;
    }
    
    // Lấy danh sách tất cả các nút đã được thiết lập (để tránh thiết lập lại)
    const initializedButtons = new Set();
    addFriendButtons.forEach(btn => {
        if (btn.dataset.initialized === 'true') {
            initializedButtons.add(btn);
        }
    });
    
    console.log(`${initializedButtons.size} buttons already initialized, ${addFriendButtons.length - initializedButtons.size} need setup`);
    
    // Add click event to each button
    addFriendButtons.forEach(button => {
        // Skip if already initialized with click listener
        if (button.dataset.initialized === 'true' && button.dataset.eventBound === 'true') {
            console.log('Button already fully initialized and has events, skipping');
            return;
        }
        
        // Đánh dấu nút đã được khởi tạo
        button.dataset.initialized = 'true';
        
        // Check button state on load
        const postElement = button.closest('.post-card');
        if (postElement) {
            const postId = postElement.dataset.postId;
            const authorElement = postElement.querySelector('.post-author .author-info h4');
            const authorName = authorElement ? authorElement.textContent.trim().replace(' (Bạn)', '') : 'Unknown';
            const authorId = button.dataset.userId || `user_${postId}`; // Use data-user-id if available, otherwise generate one
            
            // Store the user ID on the button for later use
            button.dataset.userId = authorId;
            button.dataset.userName = authorName;
            
            // In thông tin về nút để debug
            console.log(`Setting up button for: ${authorName} (${authorId})`);
            
            // Check if we need to fetch status
            const needToCheckStatus = 
                !button.dataset.statusChecked || 
                (Date.now() - parseInt(button.dataset.lastChecked || '0')) > 30000;
            
            // Check friendship status via API if available and needed
            if (needToCheckStatus && typeof apiService !== 'undefined' && apiService.friends && apiService.friends.checkFriendshipStatus) {
                checkCount++;
                // Delay checks to avoid overwhelming the API
                setTimeout(() => {
                    checkAndUpdateFriendshipStatus(button, authorId, authorName)
                        .then(() => checkComplete())
                        .catch(err => {
                            console.error(`Error checking friendship status: ${err.message}`);
                            checkComplete();
                        });
                }, checkCount * 200); // Stagger checks
            }
        }
        
        // Nếu nút là nút "Bạn bè" thì xử lý theo cách khác
        if (button.classList.contains('is-friend')) {
            console.log(`Button for user ${button.dataset.userName} is already in friend state, setting up friend options`);
            // Xóa tất cả các event listener hiện có 
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Đánh dấu nút mới
            newButton.dataset.initialized = 'true';
            newButton.dataset.eventBound = 'true';
            newButton.dataset.hasFriendOptions = 'true';
            
            // Gắn sự kiện click cho nút mới
            newButton.addEventListener('click', showFriendOptionsSheet);
            return;
        }
        
        // Kiểm tra để tránh gắn nhiều sự kiện click
        if (button.dataset.eventBound !== 'true') {
            console.log(`Binding click event to button for ${button.dataset.userName || 'unknown user'}`);
            
            // Sử dụng clone để đảm bảo không có event listener cũ
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Sao chép lại các thuộc tính dataset
            Object.keys(button.dataset).forEach(key => {
                newButton.dataset[key] = button.dataset[key];
            });
            
            // Đánh dấu nút đã được gắn sự kiện
            newButton.dataset.eventBound = 'true';
            
            newButton.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`Friend button clicked for ${this.dataset.userName || 'unknown user'}`);
                
                // Nếu nút đang được cập nhật, không thực hiện hành động
                if (this.dataset.updating === 'true') {
                    console.log('Button already being updated, skipping');
                    return;
                }
                
                // Nếu nút đã có class is-friend, sự kiện đã được xử lý bởi showFriendOptionsSheet
                if (this.classList.contains('is-friend')) {
                    return; 
                }
                
                // Get the post element and post ID
                const postElement = this.closest('.post-card');
                const postId = postElement?.dataset.postId;
                
                // Get the author name and ID
                const authorName = this.dataset.userName || (postElement ? postElement.querySelector('.post-author .author-info h4').textContent.trim().replace(' (Bạn)', '') : 'Unknown');
                const authorId = this.dataset.userId;
                
                // Check if user is logged in
                if (!localStorage.getItem('aley_token')) {
                    // Show login prompt
                    showLoginPrompt('Bạn cần đăng nhập để gửi lời mời kết bạn');
                    return;
                }
                
                // Đánh dấu nút này đang được cập nhật
                this.dataset.updating = 'true';
                
                // If the button is already in "sent" state, cancel the request directly
                if (this.classList.contains('sent')) {
                    // Hiển thị trạng thái đang xử lý trên nút
                    const originalContent = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Đang xử lý...</span>';
                    this.disabled = true;
                    
                    // Debounce để tránh nhiều request cùng lúc
                    if (this._debounceTimer) {
                        clearTimeout(this._debounceTimer);
                    }
                    
                    this._debounceTimer = setTimeout(async () => {
                        try {
                            const requestId = this.dataset.requestId;
                            if (requestId && typeof apiService !== 'undefined' && apiService.friends) {
                                await apiService.friends.cancelFriendRequest(requestId);
                                
                                // Update button state
                                this.innerHTML = '<i class="fas fa-user-plus"></i><span>Kết bạn</span>';
                                this.classList.remove('sent');
                                this.disabled = false;
                                
                                // Update all buttons for the same user
                                updateAllFriendButtonsForUser(authorId, 'default');
                                
                                // Show notification
                                showToast('success', 'Đã hủy lời mời kết bạn', `Bạn đã hủy lời mời kết bạn với ${authorName}`);
                            }
                        } catch (error) {
                            console.error('Error canceling friend request:', error);
                            showToast('error', 'Lỗi', 'Không thể hủy lời mời kết bạn. Vui lòng thử lại sau.');
                            
                            // Khôi phục nút ban đầu
                            this.innerHTML = originalContent;
                            this.disabled = false;
                        } finally {
                            this.dataset.updating = 'false';
                        }
                    }, 300);
                    
                    return;
                }
                
                // If the button is in "received" state, accept the request
                if (this.classList.contains('received')) {
                    // Hiển thị trạng thái đang xử lý trên nút
                    const originalContent = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Đang xử lý...</span>';
                    this.disabled = true;
                    
                    // Debounce để tránh nhiều request cùng lúc
                    if (this._debounceTimer) {
                        clearTimeout(this._debounceTimer);
                    }
                    
                    this._debounceTimer = setTimeout(async () => {
                        try {
                            const requestId = this.dataset.requestId;
                            if (requestId && typeof apiService !== 'undefined' && apiService.friends) {
                                const response = await apiService.friends.acceptFriendRequest(requestId);
                                
                                // Update button to "Friends" state
                                this.innerHTML = '<i class="fas fa-user-check"></i><span>Bạn bè</span>';
                                this.classList.remove('received');
                                this.classList.add('is-friend');
                                this.disabled = false;
                                
                                // Store friendship ID if available
                                if (response.success && response.data && response.data.friendship_id) {
                                    this.dataset.friendshipId = response.data.friendship_id;
                                }
                                
                                // Đánh dấu nút đã được cập nhật
                                this.dataset.updating = 'false';
                                
                                // Update all buttons for the same user
                                updateAllFriendButtonsForUser(authorId, 'is-friend', null, response.data?.friendship_id);
                                
                                // Xóa event listener hiện tại và thêm event listener mới cho tùy chọn bạn bè
                                const newFriendButton = this.cloneNode(true);
                                this.parentNode.replaceChild(newFriendButton, this);
                                
                                // Sao chép các thuộc tính dataset
                                Object.keys(this.dataset).forEach(key => {
                                    newFriendButton.dataset[key] = this.dataset[key];
                                });
                                
                                // Đánh dấu nút đã có tùy chọn bạn bè
                                newFriendButton.dataset.hasFriendOptions = 'true';
                                
                                // Thêm event listener cho tùy chọn bạn bè
                                newFriendButton.addEventListener('click', showFriendOptionsSheet);
                                
                                // Show notification
                                showToast('success', 'Đã chấp nhận lời mời kết bạn', `Bạn và ${authorName} đã trở thành bạn bè`);
                            }
                        } catch (error) {
                            // Khôi phục lại nút nếu có lỗi
                            this.innerHTML = originalContent;
                            this.disabled = false;
                            
                            console.error('Error accepting friend request:', error);
                            showToast('error', 'Lỗi', 'Không thể chấp nhận lời mời kết bạn. Vui lòng thử lại sau.');
                        } finally {
                            this.dataset.updating = 'false';
                        }
                    }, 300);
                    
                    return;
                }
                
                // Default case: sending friend request
                // Hiển thị trạng thái đang xử lý trên nút
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Đang xử lý...</span>';
                this.disabled = true;
                
                // Debounce để tránh nhiều request cùng lúc
                if (this._debounceTimer) {
                    clearTimeout(this._debounceTimer);
                }
                
                this._debounceTimer = setTimeout(async () => {
                    try {
                        if (typeof apiService !== 'undefined' && apiService.friends) {
                            const response = await apiService.friends.sendFriendRequest(authorId);
                            console.log('Friend request sent/processed:', response);
                            
                            // Check if this was an auto-accept case (received a request already from this user)
                            if (response.success && response.wasAutoAccepted) {
                                // This means we accepted their request rather than sending a new one
                                console.log('Auto-accepted existing friend request from user', authorId);
                                
                                // Update button to "Friends" state
                                this.innerHTML = '<i class="fas fa-user-check"></i><span>Bạn bè</span>';
                                this.classList.remove('sent', 'received');
                                this.classList.add('is-friend');
                                this.disabled = false;
                                
                                // Store friendship ID if available
                                if (response.data && response.data.friendship_id) {
                                    this.dataset.friendshipId = response.data.friendship_id;
                                }
                                
                                // Update all buttons for the same user
                                updateAllFriendButtonsForUser(authorId, 'is-friend', null, response.data?.friendship_id);
                                
                                // Show notification
                                showToast('success', 'Đã kết bạn', `Bạn và ${authorName} đã trở thành bạn bè`);
                                
                                // Set up friend options for the button
                                this.dataset.hasFriendOptions = 'true';
                                const newFriendButton = this.cloneNode(true);
                                this.parentNode.replaceChild(newFriendButton, this);
                                newFriendButton.addEventListener('click', showFriendOptionsSheet);
                            } else {
                                // Normal case: just sent a new friend request
                                // Update button appearance after success
                                this.innerHTML = '<i class="fas fa-user-clock"></i><span>Đã gửi</span>';
                                this.classList.add('sent');
                                this.disabled = false;
                                
                                // Store the request ID on the button for cancel operations
                                if (response.success && response.data && response.data.request_id) {
                                    this.dataset.requestId = response.data.request_id;
                                    
                                    // Show success notification
                                    showToast('success', 'Đã gửi lời mời kết bạn', `Bạn đã gửi lời mời kết bạn đến ${authorName}`);
                                    
                                    // Update all buttons for the same user
                                    updateAllFriendButtonsForUser(authorId, 'sent', response.data.request_id);
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error sending friend request:', error);
                        
                        // Kiểm tra xem lỗi có phải do đã gửi lời mời kết bạn cho người này rồi hay không
                        if (error.message && error.message.includes('đã gửi lời mời') || error.code === 'REQUEST_ALREADY_SENT') {
                            // Đây là trường hợp lỗi 409 CONFLICT - đã gửi lời mời rồi
                            console.log('Already sent friend request to this user');
                            
                            // Cập nhật giao diện nút thành "Huỷ lời mời"
                            this.innerHTML = '<i class="fas fa-user-clock"></i><span>Hủy lời mời</span>';
                            this.classList.add('sent');
                            this.disabled = false;
                            
                            // Thử lấy request_id từ lỗi nếu có
                            if (error.request_id) {
                                this.dataset.requestId = error.request_id;
                                
                                // Update all buttons for the same user
                                updateAllFriendButtonsForUser(authorId, 'sent', error.request_id);
                            }
                            
                            // Hiển thị thông báo thích hợp
                            showToast('info', 'Đã gửi trước đó', `Bạn đã gửi lời mời kết bạn đến ${authorName} trước đó`);
                            
                            // Gọi kiểm tra lại trạng thái để cố gắng lấy request_id nếu chưa có
                            if (!this.dataset.requestId) {
                                try {
                                    checkAndUpdateFriendshipStatus(this, authorId, authorName);
                                } catch (checkError) {
                                    console.error('Error checking friendship status:', checkError);
                                }
                            }
                        } else {
                            // Các lỗi khác - quay lại trạng thái ban đầu
                            this.innerHTML = '<i class="fas fa-user-plus"></i><span>Kết bạn</span>';
                            this.classList.remove('sent');
                            this.disabled = false;
                            
                            // Show error notification
                            showToast('error', 'Lỗi', 'Không thể gửi lời mời kết bạn. Vui lòng thử lại sau.');
                        }
                    } finally {
                        this.dataset.updating = 'false';
                    }
                }, 300);
            });
        }
    });
    
    // Sau khi thiết lập tất cả các nút, cho phép thiết lập lại sau 3 giây
    setTimeout(() => {
        window.isSettingUpFriendButtons = false;
        console.log('Friend buttons setup completed and ready for next initialization');
    }, 3000);
}

// Hàm để kiểm tra và cập nhật trạng thái kết bạn
async function checkAndUpdateFriendshipStatus(button, userId, userName) {
    console.log(`Checking friendship status for user ${userId} (${userName})`);
    
    // Nếu nút đang được cập nhật, bỏ qua
    if (button.dataset.updating === 'true') {
        console.log(`Button for ${userName} is already being updated, skipping check`);
        return;
    }
    
    // Đánh dấu nút đang cập nhật
    button.dataset.updating = 'true';
    
    try {
        const response = await apiService.friends.checkFriendshipStatus(userId);
        console.log(`Friendship status for ${userName} (${userId}):`, response);
        
        // Đánh dấu đã kiểm tra và thời gian kiểm tra
        button.dataset.statusChecked = 'true';
        button.dataset.lastChecked = Date.now().toString();
        
        if (response.success && response.data) {
            const status = response.data.status;
            console.log(`Status for ${userName}: ${status}`);
            
            // Cập nhật giao diện nút dựa trên trạng thái kết bạn
            switch(status) {
                case 'friends':
                    // Nếu là bạn bè
                    button.innerHTML = '<i class="fas fa-user-check"></i><span>Bạn bè</span>';
                    button.classList.remove('sent', 'received');
                    button.classList.add('is-friend');
                    
                    // Lưu friendship_id nếu có
                    if (response.data.friendship_id) {
                        button.dataset.friendshipId = response.data.friendship_id;
                    }
                    
                    // Thêm sự kiện khi nhấp để hiển thị tùy chọn bạn bè (nếu chưa có)
                    if (button.dataset.hasFriendOptions !== 'true') {
                        // Xóa các sự kiện click cũ
                        const oldClick = button.onclick;
                        button.onclick = null;
                        
                        // Thêm sự kiện click mới
                        button.addEventListener('click', showFriendOptionsSheet);
                        button.dataset.hasFriendOptions = 'true';
                    }
                    
                    // Cập nhật tất cả các nút cho cùng một người dùng
                    updateAllFriendButtonsForUser(userId, 'is-friend', null, response.data.friendship_id);
                    break;
                    
                case 'pending_sent':
                    // Nếu đã gửi lời mời kết bạn
                    button.innerHTML = '<i class="fas fa-user-clock"></i><span>Đã gửi</span>';
                    button.classList.remove('is-friend', 'received');
                    button.classList.add('sent');
                    
                    // Lưu request_id nếu có
                    if (response.data.request_id) {
                        button.dataset.requestId = response.data.request_id;
                    }
                    
                    // Cập nhật tất cả các nút cho cùng một người dùng
                    updateAllFriendButtonsForUser(userId, 'sent', response.data.request_id);
                    break;
                    
                case 'pending_received':
                    // Nếu đã nhận lời mời kết bạn
                    // Make the button text even more explicit to avoid confusion
                    button.innerHTML = '<i class="fas fa-user-plus"></i><span>Chấp nhận lời mời</span>';
                    button.classList.remove('is-friend', 'sent');
                    button.classList.add('received');
                    
                    // Lưu request_id nếu có
                    if (response.data.request_id) {
                        button.dataset.requestId = response.data.request_id;
                    }
                    
                    // Add a title attribute for more clarity on hover
                    if (userName) {
                        button.title = 'Chấp nhận lời mời kết bạn từ ' + userName;
                    }
                    
                    // Update all buttons for this user
                    updateAllFriendButtonsForUser(userId, 'received', response.data.request_id);
                    break;
                    
                default: // case 'not_friends'
                    // Nếu không phải bạn bè
                    button.innerHTML = '<i class="fas fa-user-plus"></i><span>Kết bạn</span>';
                    button.classList.remove('is-friend', 'sent', 'received');
                    
                    // Cập nhật tất cả các nút cho cùng một người dùng
                    updateAllFriendButtonsForUser(userId, 'default');
                    break;
            }
        }
    } catch (error) {
        console.error(`Error checking friendship status for ${userName}:`, error);
    } finally {
        // Đánh dấu nút không còn cập nhật
        button.dataset.updating = 'false';
    }
}

/**
 * Hiển thị tùy chọn bạn bè khi nhấp vào nút "Bạn bè"
 * @param {Event} e - Sự kiện click
 */
function showFriendOptionsSheet(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Opening friend options sheet');
    
    // Lấy nút đã được nhấp vào
    const button = e.currentTarget || e.target.closest('.add-friend-btn') || e.target.closest('.friends-btn');
    if (!button) {
        console.error('Cannot find button in showFriendOptionsSheet');
        return;
    }
    
    // Kiểm tra nếu nút là nút "Bạn bè" (thông qua class is-friend hoặc friends-btn)
    if (!button.classList.contains('is-friend') && !button.classList.contains('friends-btn')) {
        console.log('Button is not in friend state, ignoring showFriendOptionsSheet call');
        return;
    }
    
    const userId = button.dataset.userId;
    const userName = button.dataset.userName;
    const friendshipId = button.dataset.friendshipId;
    
    console.log(`Showing options for ${userName} (${userId}), friendshipId: ${friendshipId}`);
    
    // Xóa sheet cũ nếu đã tồn tại
    const existingSheet = document.querySelector('.friend-options-sheet');
    if (existingSheet) {
        existingSheet.remove();
    }
    
    // Xóa backdrop cũ nếu đã tồn tại
    const existingBackdrop = document.querySelector('.sheet-backdrop');
    if (existingBackdrop) {
        existingBackdrop.remove();
    }
    
    // Tạo sheet tùy chọn
    const sheet = document.createElement('div');
    sheet.className = 'friend-options-sheet animate__animated animate__fadeInUp';
    sheet.innerHTML = `
        <div class="sheet-header">
            <h4>${userName}</h4>
            <button class="close-sheet"><i class="fas fa-times"></i></button>
        </div>
        <div class="sheet-options">
            <button class="sheet-option view-profile">
                <i class="fas fa-user"></i>
                <span>Xem trang cá nhân</span>
            </button>
            <button class="sheet-option unfriend">
                <i class="fas fa-user-minus"></i>
                <span>Huỷ kết bạn</span>
            </button>
            <button class="sheet-option block-user">
                <i class="fas fa-ban"></i>
                <span>Chặn người dùng này</span>
            </button>
        </div>
    `;
    
    // Thêm sheet vào body
    document.body.appendChild(sheet);
    
    // Thêm backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'sheet-backdrop';
    document.body.appendChild(backdrop);
    
    // Xử lý đóng sheet
    const closeBtn = sheet.querySelector('.close-sheet');
    closeBtn.addEventListener('click', closeSheet);
    backdrop.addEventListener('click', closeSheet);
    
    // Xử lý các tùy chọn
    const viewProfileBtn = sheet.querySelector('.view-profile');
    viewProfileBtn.addEventListener('click', () => {
        // Chuyển đến trang cá nhân
        window.location.href = `/profile.html?id=${userId}`;
        closeSheet();
    });
    
    const unfriendBtn = sheet.querySelector('.unfriend');
    unfriendBtn.addEventListener('click', async () => {
        try {
            // Hiển thị xác nhận nếu cần
            if (confirm(`Bạn có chắc muốn huỷ kết bạn với ${userName}?`)) {
                // Đánh dấu đang xử lý
                unfriendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Đang xử lý...</span>';
                unfriendBtn.disabled = true;
                
                console.log(`Unfriending user ${userName} (${userId})`);
                
                // Gọi API huỷ kết bạn
                try {
                    const response = await apiService.friends.unfriendUser(userId);
                    console.log('Unfriend response:', response);
                    
                    // Xử lý phản hồi API
                    if (response.success) {
                        console.log(`Successfully unfriended ${userName}`);
                        
                        closeSheet();
                        
                        // Lấy tất cả các nút kết bạn của người dùng này
                        const allFriendButtons = document.querySelectorAll(`.add-friend-btn[data-user-id="${userId}"], .friends-btn[data-user-id="${userId}"]`);
                        console.log(`Found ${allFriendButtons.length} buttons to update after unfriending`);
                        
                        // Cập nhật tất cả các nút
                        updateAllFriendButtonsForUser(userId, 'default');
                        
                        // Hiển thị thông báo thành công
                        showToast('success', 'Đã huỷ kết bạn', `Bạn đã huỷ kết bạn với ${userName}`);
                    } else {
                        console.error('Error from API when unfriending:', response.error);
                        
                        // Nếu là lỗi "Mối quan hệ bạn bè không tồn tại", vẫn xử lý như thành công
                        if (response.error && response.error.message && response.error.message.includes('không tồn tại')) {
                            console.log('Friendship already ended, updating UI anyway');
                            
                            closeSheet();
                            
                            // Cập nhật tất cả các nút
                            updateAllFriendButtonsForUser(userId, 'default');
                            
                            // Hiển thị thông báo
                            showToast('info', 'Đã huỷ kết bạn', `Bạn và ${userName} không còn là bạn bè`);
                        } else {
                            closeSheet();
                            showToast('error', 'Lỗi', response.error?.message || 'Không thể huỷ kết bạn. Vui lòng thử lại sau.');
                        }
                    }
                } catch (apiError) {
                    console.error('Error unfriending user:', apiError);
                    
                    // Nếu là lỗi "Mối quan hệ bạn bè không tồn tại", vẫn xử lý như thành công
                    if (apiError.message && apiError.message.includes('không tồn tại')) {
                        console.log('Friendship already ended, updating UI anyway');
                        
                        closeSheet();
                        
                        // Cập nhật tất cả các nút
                        updateAllFriendButtonsForUser(userId, 'default');
                        
                        // Hiển thị thông báo
                        showToast('info', 'Đã huỷ kết bạn', `Bạn và ${userName} không còn là bạn bè`);
                    } else {
                        closeSheet();
                        showToast('error', 'Lỗi', 'Không thể huỷ kết bạn. Vui lòng thử lại sau.');
                    }
                }
            } else {
                // Người dùng hủy thao tác
                closeSheet();
            }
        } catch (error) {
            console.error('General error in unfriend UI handler:', error);
            closeSheet();
            showToast('error', 'Lỗi', 'Không thể huỷ kết bạn. Vui lòng thử lại sau.');
        }
    });
    
    const blockUserBtn = sheet.querySelector('.block-user');
    blockUserBtn.addEventListener('click', () => {
        // Chức năng chặn người dùng (có thể phát triển sau)
        showToast('info', 'Chức năng đang phát triển', 'Tính năng chặn người dùng đang được phát triển');
        closeSheet();
    });
    
    function closeSheet() {
        sheet.classList.remove('animate__fadeInUp');
        sheet.classList.add('animate__fadeOutDown');
        backdrop.classList.add('animate__fadeOut');
        
        setTimeout(() => {
            sheet.remove();
            backdrop.remove();
        }, 300);
    }
    
    // Thêm CSS vào document nếu chưa có
    if (!document.getElementById('friend-options-sheet-styles')) {
        const style = document.createElement('style');
        style.id = 'friend-options-sheet-styles';
        style.textContent = `
            .sheet-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 9998;
            }
            
            .friend-options-sheet {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background-color: white;
                border-radius: 12px 12px 0 0;
                padding: 16px;
                z-index: 9999;
                box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .sheet-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 12px;
                border-bottom: 1px solid #eee;
                margin-bottom: 12px;
            }
            
            .sheet-header h4 {
                margin: 0;
                font-size: 18px;
            }
            
            .close-sheet {
                background: none;
                border: none;
                font-size: 18px;
                color: #777;
                cursor: pointer;
            }
            
            .sheet-options {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .sheet-option {
                display: flex;
                align-items: center;
                gap: 12px;
                background: none;
                border: none;
                padding: 12px;
                text-align: left;
                font-size: 16px;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .sheet-option:hover {
                background-color: #f5f5f5;
            }
            
            .sheet-option i {
                font-size: 18px;
                width: 24px;
                text-align: center;
            }
            
            .unfriend {
                color: #e74c3c;
            }
            
            .block-user {
                color: #e74c3c;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Display a toast notification
 * @param {string} type - The type of toast (success, error)
 * @param {string} title - The toast title
 * @param {string} message - The toast message
 */
function showToast(type, title, message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate__animated animate__fadeInUp`;
    
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add toast to the document
    document.body.appendChild(toast);
    
    // Handle toast close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.add('animate__fadeOutDown');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.classList.add('animate__fadeOutDown');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    toast.remove();
                }
            }, 300);
        }
    }, 5000);
}

/**
 * Display login prompt when trying to perform actions that require login
 * @param {string} message - The message to display
 */
function showLoginPrompt(message) {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'login-prompt-modal animate__animated animate__fadeInDown';
    
    modal.innerHTML = `
        <div class="login-prompt-header">
            <h3>Đăng nhập</h3>
            <button class="close-modal"><i class="fas fa-times"></i></button>
        </div>
        <div class="login-prompt-body">
            <p>${message}</p>
        </div>
        <div class="login-prompt-footer">
            <button class="cancel-btn">Huỷ bỏ</button>
            <button class="login-btn">Đăng nhập ngay</button>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
    
    // Handle close button
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const loginBtn = modal.querySelector('.login-btn');
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    
    loginBtn.addEventListener('click', () => {
        window.location.href = '/index.html?redirect=' + encodeURIComponent(window.location.href);
    });
    
    function closeModal() {
        modal.classList.remove('animate__fadeInDown');
        modal.classList.add('animate__fadeOutUp');
        
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
                backdrop.remove();
            }
        }, 300);
    }
}

// Add to global scope for use in other modules
window.setupFriendRequestButtons = setupFriendRequestButtons;

// Hàm khởi tạo nút kết bạn một lần
function initializeFriendButtons() {
    console.log('Initializing friend buttons system...');
    
    // Thiết lập ban đầu cho các nút hiện có
    setupFriendRequestButtons();
    
    // Theo dõi các thay đổi trong DOM để thiết lập nút cho các bài viết mới
    const feedElement = document.querySelector('.feed');
    if (feedElement) {
        // Kiểm tra nếu observer đã được thiết lập trước đó
        if (window.friendButtonsObserver) {
            window.friendButtonsObserver.disconnect();
        }
        
        console.log('Setting up MutationObserver for friend buttons');
        window.friendButtonsObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Tìm các nút mới được thêm vào
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {  // Element node
                            // Nếu node là post-card hoặc chứa post-card
                            if (node.classList && node.classList.contains('post-card') || node.querySelector('.post-card')) {
                                console.log('New post detected, setting up friend buttons...');
                                setTimeout(setupFriendRequestButtons, 200);
                            }
                        }
                    });
                }
            });
        });
        
        // Bắt đầu theo dõi thay đổi
        window.friendButtonsObserver.observe(feedElement, {
            childList: true,
            subtree: true
        });
        
        console.log('Friend buttons observer activated');
    }
    
    // Sử dụng event delegation để bắt tất cả các nút kết bạn, kể cả những nút được thêm sau
    document.body.addEventListener('click', function(e) {
        // Bắt sự kiện cho nút kết bạn
        const addFriendButton = e.target.closest('.add-friend-btn');
        if (addFriendButton && !addFriendButton.dataset.eventBound) {
            console.log('Caught click on unbound friend button - binding events');
            // Đánh dấu nút đã được gắn sự kiện thông qua click
            addFriendButton.dataset.eventBound = 'true';
            
            // Kích hoạt thiết lập nút
            setupFriendRequestButtons();
        }
        
        // Bắt sự kiện cho nút bạn bè
        const friendsButton = e.target.closest('.friends-btn');
        if (friendsButton) {
            console.log('Friends button clicked, showing options');
            
            // Đảm bảo nút có thông tin người dùng
            if (!friendsButton.dataset.userId) {
                console.warn('Friends button missing user ID', friendsButton);
                return;
            }
            
            // Đặt trạng thái là bạn bè để menu tùy chọn có thể hiển thị
            friendsButton.classList.add('is-friend');
            
            // Lấy tên người dùng (hoặc sử dụng ID nếu không có tên)
            const userName = friendsButton.dataset.userName || 
                             friendsButton.getAttribute('title')?.replace('Bạn bè với ', '') || 
                             'Người dùng';
            
            // Thiết lập dữ liệu cho menu tùy chọn
            friendsButton.dataset.userName = userName;
            
            // Hiển thị menu tùy chọn bạn bè
            showFriendOptionsSheet(e);
        }
    });
}

// Initialize the add friend buttons when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing friend button system');
    initializeFriendButtons();
    
    // Thêm trình nghe click toàn cục cho mục đích debug
    document.body.addEventListener('click', function(e) {
        // Debug cho cả nút add-friend-btn và friends-btn
        const targetButton = e.target.closest('.add-friend-btn') || e.target.closest('.friends-btn');
        if (targetButton) {
            console.log('DEBUG: Button clicked:', targetButton);
            console.log('Button state:', {
                type: targetButton.classList.contains('friends-btn') ? 'friends-btn' : 'add-friend-btn',
                isFriend: targetButton.classList.contains('is-friend'),
                isSent: targetButton.classList.contains('sent'),
                isReceived: targetButton.classList.contains('received'),
                userId: targetButton.dataset.userId,
                userName: targetButton.dataset.userName,
                friendshipId: targetButton.dataset.friendshipId,
                requestId: targetButton.dataset.requestId,
                initialized: targetButton.dataset.initialized,
                eventBound: targetButton.dataset.eventBound,
                updating: targetButton.dataset.updating,
                hasFriendOptions: targetButton.dataset.hasFriendOptions
            });
        }
    }, true);
    
    // Thêm nút cài đặt lại trạng thái bạn bè
    addResetFriendshipStatusButton();
});

/**
 * Thêm nút cài đặt lại trạng thái bạn bè vào DOM
 */
function addResetFriendshipStatusButton() {
    // Chỉ thêm trong môi trường phát triển
    if (!window.location.href.includes('localhost')) {
        return;
    }
    
    // Tạo nút cài đặt lại
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Cài đặt lại trạng thái bạn bè';
    resetButton.className = 'dev-reset-button';
    resetButton.style.position = 'fixed';
    resetButton.style.bottom = '20px';
    resetButton.style.right = '20px';
    resetButton.style.zIndex = '9999';
    resetButton.style.backgroundColor = '#4a76a8';
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.borderRadius = '5px';
    resetButton.style.padding = '10px 15px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    
    // Thêm sự kiện click
    resetButton.addEventListener('click', function() {
        console.log('Resetting friendship statuses...');
        
        // Xóa cache trạng thái bạn bè
        window.friendshipStatusCache = {};
        
        // Khởi tạo lại dữ liệu mẫu
        if (typeof initializeFriendshipMockData === 'function') {
            initializeFriendshipMockData();
        }
        
        // Cài đặt lại trạng thái đã khởi tạo của các nút
        document.querySelectorAll('.add-friend-btn').forEach(btn => {
            btn.dataset.statusChecked = 'false';
            btn.dataset.lastChecked = '0';
        });
        
        // Thiết lập lại các nút kết bạn
        window.isSettingUpFriendButtons = false;
        setupFriendRequestButtons();
        
        alert('Đã cài đặt lại trạng thái bạn bè. Trang sẽ được làm mới.');
        
        // Làm mới trang sau 1 giây
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    });
    
    // Thêm nút vào trang
    document.body.appendChild(resetButton);
}

/**
 * Update all friend buttons for the same user
 * @param {string} userId - The user ID to update buttons for
 * @param {string} status - The new status ('sent', 'received', 'is-friend')
 * @param {string} requestId - The request ID (for sent/received)
 * @param {string} friendshipId - The friendship ID (for friends)
 */
function updateAllFriendButtonsForUser(userId, status, requestId = null, friendshipId = null) {
    console.log(`Updating all buttons for user ${userId} to status: ${status}`);
    
    // Tìm tất cả các nút kết bạn cho người dùng này - bao gồm cả .add-friend-btn và .friends-btn
    const allButtons = document.querySelectorAll(`.add-friend-btn[data-user-id="${userId}"], .friends-btn[data-user-id="${userId}"]`);
    console.log(`Found ${allButtons.length} buttons for user ${userId}`);
    
    if (allButtons.length === 0) {
        console.log(`No buttons found for user ${userId}`);
        return;
    }
    
    allButtons.forEach(btn => {
        // Bỏ qua nếu nút đang cập nhật
        if (btn.dataset.updating === 'true') {
            console.log('Skipping button that is already being updated');
            return;
        }
        
        // Lưu lại userName từ button hiện tại nếu có
        const userName = btn.dataset.userName || '';
        
        // Tạo nút mới để thay thế nút cũ
        const newBtn = btn.cloneNode(true);
        
        // Cập nhật dataset
        newBtn.dataset.statusChecked = 'true';
        newBtn.dataset.lastChecked = Date.now().toString();
        newBtn.dataset.userId = userId;
        
        // Giữ lại userName nếu đã có
        if (userName) {
            newBtn.dataset.userName = userName;
        }
        
        // Xóa tất cả các lớp trạng thái
        newBtn.classList.remove('is-friend', 'sent', 'received');
        
        // Xóa class friends-btn để đảm bảo tất cả các nút sẽ có cùng một kiểu
        newBtn.classList.remove('friends-btn');
        // Đảm bảo nút có class add-friend-btn
        newBtn.classList.add('add-friend-btn');
        
        // Cập nhật giao diện dựa trên trạng thái
        switch(status) {
            case 'is-friend':
                newBtn.innerHTML = '<i class="fas fa-user-check"></i><span>Bạn bè</span>';
                newBtn.classList.add('is-friend');
                
                // Lưu friendship_id nếu có
                if (friendshipId) {
                    newBtn.dataset.friendshipId = friendshipId;
                }
                
                // Đánh dấu có tùy chọn bạn bè
                newBtn.dataset.hasFriendOptions = 'true';
                
                // Thay thế nút cũ bằng nút mới
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Gắn sự kiện click cho tùy chọn bạn bè
                newBtn.addEventListener('click', showFriendOptionsSheet);
                break;
                
            case 'sent':
                newBtn.innerHTML = '<i class="fas fa-user-clock"></i><span>Đã gửi</span>';
                newBtn.classList.add('sent');
                
                // Lưu request_id nếu có
                if (requestId) {
                    newBtn.dataset.requestId = requestId;
                }
                
                // Thay thế nút cũ bằng nút mới
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Gắn lại sự kiện click (sẽ được xử lý bởi setupFriendRequestButtons)
                newBtn.dataset.eventBound = 'false';
                break;
                
            case 'received':
                newBtn.innerHTML = '<i class="fas fa-user-plus"></i><span>Chấp nhận lời mời</span>';
                newBtn.classList.add('received');
                
                // Lưu request_id nếu có
                if (requestId) {
                    newBtn.dataset.requestId = requestId;
                }
                
                // Add a title attribute for more clarity on hover
                if (userName) {
                    newBtn.title = 'Chấp nhận lời mời kết bạn từ ' + userName;
                }
                
                // Thay thế nút cũ bằng nút mới
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Gắn lại sự kiện click (sẽ được xử lý bởi setupFriendRequestButtons)
                newBtn.dataset.eventBound = 'false';
                break;
                
            default: // case 'default' hoặc 'not_friends'
                newBtn.innerHTML = '<i class="fas fa-user-plus"></i><span>Kết bạn</span>';
                
                // Xóa request_id nếu có
                if (newBtn.dataset.requestId) {
                    delete newBtn.dataset.requestId;
                }
                
                // Xóa friendship_id nếu có
                if (newBtn.dataset.friendshipId) {
                    delete newBtn.dataset.friendshipId;
                }
                
                // Thay thế nút cũ bằng nút mới
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Gắn lại sự kiện click (sẽ được xử lý bởi setupFriendRequestButtons)
                newBtn.dataset.eventBound = 'false';
                break;
        }
    });
    
    // Sau khi cập nhật, gọi lại setupFriendRequestButtons
    setTimeout(() => {
        if (typeof setupFriendRequestButtons === 'function') {
            setupFriendRequestButtons();
        }
    }, 100);
} 