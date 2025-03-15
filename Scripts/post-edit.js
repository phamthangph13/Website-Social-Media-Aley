/**
 * Post Edit Functionality
 * Handles edit modal, edit operations and related UI interactions
 */

// Biến lưu trữ thông tin bài viết đang chỉnh sửa
let currentEditingPost = null;

// Hàm hiển thị modal chỉnh sửa bài viết
function showEditPostModal(post) {
    // Lưu thông tin bài viết hiện tại đang chỉnh sửa
    currentEditingPost = post;
    
    // Lấy các phần tử DOM cần thiết
    const modal = document.querySelector('.edit-post-modal');
    const overlay = document.querySelector('.modal-overlay');
    const textarea = document.getElementById('edit-post-content');
    const avatarImg = modal.querySelector('.avatar img');
    const privacyBtn = modal.querySelector('.privacy-btn');
    const privacyIcon = privacyBtn.querySelector('i:first-child');
    const privacyText = modal.querySelector('.privacy-text');
    
    // Cập nhật nội dung bài viết vào textarea
    if (textarea) {
        // Loại bỏ định dạng HTML từ nội dung bài viết (nếu có)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = post.content || '';
        textarea.value = tempDiv.textContent || tempDiv.innerText || '';
    }
    
    // Cập nhật avatar
    if (avatarImg && post.author && post.author.avatar) {
        avatarImg.src = post.author.avatar;
    }
    
    // Cập nhật quyền riêng tư
    if (privacyBtn && post.privacy) {
        // Cập nhật biểu tượng quyền riêng tư
        if (privacyIcon) {
            // Xóa các class icon cũ
            privacyIcon.className = '';
            privacyIcon.classList.add('fas');
            
            // Thêm icon tương ứng với privacy
            if (post.privacy === 'private') {
                privacyIcon.classList.add('fa-lock');
                privacyText.textContent = 'Chỉ mình tôi';
            } else if (post.privacy === 'friends') {
                privacyIcon.classList.add('fa-user-friends');
                privacyText.textContent = 'Bạn bè';
            } else {
                privacyIcon.classList.add('fa-globe');
                privacyText.textContent = 'Công khai';
            }
        }
    }
    
    // Hiển thị modal và overlay
    if (modal && overlay) {
        modal.classList.add('active');
        overlay.classList.add('active');
        
        // Focus vào textarea
        if (textarea) {
            setTimeout(() => {
                textarea.focus();
                // Di chuyển con trỏ đến cuối văn bản
                textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
            }, 300);
        }
    }
    
    // Thiết lập sự kiện đóng modal
    setupCloseModalEvents();
    
    // Thiết lập sự kiện cho nút lưu
    setupSaveEditEvent();
    
    // Thiết lập sự kiện cho privacy dropdown
    setupPrivacyDropdownEvents();
}

// Hàm ẩn modal chỉnh sửa bài viết
function hideEditPostModal() {
    const modal = document.querySelector('.edit-post-modal');
    const overlay = document.querySelector('.modal-overlay');
    
    if (modal) {
        modal.classList.remove('active');
    }
    
    if (overlay) {
        overlay.classList.remove('active');
    }
    
    // Xóa thông tin bài viết đang chỉnh sửa
    currentEditingPost = null;
}

// Thiết lập sự kiện đóng modal
function setupCloseModalEvents() {
    const closeBtn = document.querySelector('.close-edit-modal');
    const overlay = document.querySelector('.modal-overlay');
    
    // Sự kiện cho nút đóng
    if (closeBtn) {
        closeBtn.addEventListener('click', hideEditPostModal);
    }
    
    // Sự kiện khi click vào overlay
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                hideEditPostModal();
            }
        });
    }
    
    // Sự kiện khi nhấn phím Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideEditPostModal();
        }
    });
}

// Thiết lập sự kiện cho nút lưu chỉnh sửa
function setupSaveEditEvent() {
    const saveBtn = document.querySelector('.save-edit-btn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            // Lấy nội dung đã chỉnh sửa
            const editedContent = document.getElementById('edit-post-content').value;
            
            if (!editedContent.trim()) {
                alert('Nội dung bài viết không được để trống!');
                return;
            }
            
            // Lấy quyền riêng tư được chọn
            const privacyText = document.querySelector('.edit-post-footer .privacy-text').textContent;
            let privacy = 'public';
            
            if (privacyText === 'Bạn bè') {
                privacy = 'friends';
            } else if (privacyText === 'Chỉ mình tôi') {
                privacy = 'private';
            }
            
            // Hiển thị loading
            showPostLoading();
            
            // Giả lập tiến trình cập nhật (thay bằng API thực tế)
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 10;
                if (progress <= 100) {
                    updateProgressBar(progress);
                } else {
                    clearInterval(progressInterval);
                    
                    // Sau khi hoàn thành, ẩn loading
                    setTimeout(() => {
                        hidePostLoading();
                        
                        // Cập nhật nội dung bài viết trên giao diện
                        if (currentEditingPost) {
                            // Tìm phần tử bài viết trên DOM
                            const postElement = document.querySelector(`.post-card[data-post-id="${currentEditingPost.post_id}"]`);
                            
                            if (postElement) {
                                // Cập nhật nội dung bài viết
                                const contentElement = postElement.querySelector('.post-content p');
                                if (contentElement) {
                                    // Định dạng nội dung với hashtag nếu có
                                    const formattedContent = window.hashtagFormatter ? 
                                        window.hashtagFormatter.formatTextWithHashtags(editedContent) : 
                                        editedContent;
                                    
                                    // Cập nhật nội dung
                                    contentElement.innerHTML = formattedContent;
                                    
                                    // Cập nhật icon quyền riêng tư
                                    const privacyIcon = postElement.querySelector('.author-info p i');
                                    if (privacyIcon) {
                                        privacyIcon.className = '';
                                        privacyIcon.classList.add('fas');
                                        
                                        if (privacy === 'private') {
                                            privacyIcon.classList.add('fa-lock');
                                        } else if (privacy === 'friends') {
                                            privacyIcon.classList.add('fa-user-friends');
                                        } else {
                                            privacyIcon.remove(); // Xóa icon nếu là công khai
                                        }
                                    } else if (privacy !== 'public') {
                                        // Nếu không có icon nhưng cần hiển thị
                                        const dateElement = postElement.querySelector('.author-info p');
                                        if (dateElement) {
                                            const iconClass = privacy === 'private' ? 'fa-lock' : 'fa-user-friends';
                                            dateElement.innerHTML += ` <i class="fas ${iconClass}"></i>`;
                                        }
                                    }
                                    
                                    // Cập nhật dữ liệu bài viết
                                    currentEditingPost.content = editedContent;
                                    currentEditingPost.privacy = privacy;
                                }
                            }
                        }
                        
                        // Hiển thị thông báo thành công
                        const notification = document.createElement('div');
                        notification.className = 'save-notification';
                        notification.textContent = 'Đã cập nhật bài viết';
                        document.body.appendChild(notification);
                        
                        setTimeout(() => {
                            notification.classList.add('show');
                            setTimeout(() => {
                                notification.classList.remove('show');
                                setTimeout(() => {
                                    notification.remove();
                                }, 300);
                            }, 2000);
                        }, 10);
                        
                        // Đóng modal
                        hideEditPostModal();
                    }, 500);
                }
            }, 100);
            
            // Trong thực tế, bạn sẽ gọi API và xử lý phản hồi tại đây
            // apiService.posts.updatePost(currentEditingPost.post_id, { content: editedContent, privacy })
            //     .then(response => {
            //         hidePostLoading();
            //         // Cập nhật giao diện và hiển thị thông báo thành công
            //         hideEditPostModal();
            //     })
            //     .catch(error => {
            //         hidePostLoading();
            //         alert('Cập nhật bài viết thất bại: ' + error.message);
            //     });
        });
    }
}

// Thiết lập sự kiện cho privacy dropdown trong modal chỉnh sửa
function setupPrivacyDropdownEvents() {
    const privacyBtn = document.querySelector('.edit-post-footer .privacy-btn');
    const privacyDropdown = document.querySelector('.edit-post-footer .privacy-dropdown');
    const privacyOptions = document.querySelectorAll('.edit-post-footer .privacy-option');
    
    // Sự kiện cho nút privacy
    if (privacyBtn && privacyDropdown) {
        privacyBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            privacyDropdown.classList.toggle('active');
        });
        
        // Sự kiện khi click ra ngoài để đóng dropdown
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.edit-post-footer .privacy-selector') && privacyDropdown.classList.contains('active')) {
                privacyDropdown.classList.remove('active');
            }
        });
    }
    
    // Sự kiện khi chọn một privacy option
    if (privacyOptions.length > 0) {
        privacyOptions.forEach(option => {
            option.addEventListener('click', function() {
                const privacy = this.dataset.privacy;
                const privacyName = this.querySelector('.privacy-name').textContent;
                const iconClass = this.querySelector('i').className;
                
                // Cập nhật hiển thị privacy
                const privacyText = document.querySelector('.edit-post-footer .privacy-text');
                const privacyIcon = document.querySelector('.edit-post-footer .privacy-btn i:first-child');
                
                if (privacyText) {
                    privacyText.textContent = privacyName;
                }
                
                if (privacyIcon) {
                    privacyIcon.className = iconClass;
                }
                
                // Đóng dropdown
                privacyDropdown.classList.remove('active');
            });
        });
    }
}

// Khởi tạo các sự kiện khi document sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    // Bất kỳ thiết lập nào cần làm khi trang tải xong
    // (Các xử lý chính thường được gọi từ trang sử dụng file này)
}); 