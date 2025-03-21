/**
 * Aley API Service
 * Provides methods to interact with the Aley backend API
 */

const AleyAPI = {
    // Base URL for API calls
    baseUrl: 'http://localhost:5000/api',
    
    // Utility methods
    _handleResponse: async function(response) {
        const data = await response.json();
        
        if (!response.ok) {
            // Check for token expiration (401 Unauthorized)
            if (response.status === 401) {
                console.log('Token expired or invalid. Logging out...');
                // Clear the token from local storage
                localStorage.removeItem('aley_token');
                localStorage.removeItem('aley_user_avatar');
                localStorage.removeItem('aley_user_name');
                
                // Show brief notification to user
                this._showExpiredTokenNotification();
                
                // Redirect to login page after a short delay
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
            }
            
            throw new Error(data.message || 'Something went wrong');
        }
        
        // Không cần xử lý đặc biệt cho trường bio - chỉ dùng profile-bio
        console.log('API response data:', data);
        
        return data;
    },
    
    _showExpiredTokenNotification: function() {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '0';
        notification.style.left = '0';
        notification.style.width = '100%';
        notification.style.padding = '15px';
        notification.style.backgroundColor = '#f8d7da';
        notification.style.color = '#721c24';
        notification.style.textAlign = 'center';
        notification.style.zIndex = '9999';
        notification.textContent = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại...';
        document.body.prepend(notification);
    },
    
    _getAuthHeader: function() {
        const token = localStorage.getItem('aley_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    },
    
    // Authentication methods
    Auth: {
        // Check if user is logged in
        isLoggedIn: function() {
            return !!localStorage.getItem('aley_token');
        },
        
        // Register a new user
        register: async function(userData) {
            const response = await fetch(`${AleyAPI.baseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            return AleyAPI._handleResponse(response);
        },
        
        // Login user
        login: async function(email, password) {
            const response = await fetch(`${AleyAPI.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await AleyAPI._handleResponse(response);
            
            // Save token to localStorage
            if (data.token) {
                localStorage.setItem('aley_token', data.token);
            }
            
            return data;
        },
        
        // Logout user
        logout: function() {
            localStorage.removeItem('aley_token');
            // Redirect to login page
            window.location.href = '/';
        },
        
        // Verify email
        verifyEmail: async function(token) {
            const response = await fetch(`${AleyAPI.baseUrl}/auth/verify/${token}`, {
                method: 'GET'
            });
            
            return AleyAPI._handleResponse(response);
        },
        
        // Forgot password - request reset link
        forgotPassword: async function(email) {
            const response = await fetch(`${AleyAPI.baseUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            return AleyAPI._handleResponse(response);
        },
        
        // Reset password with token
        resetPassword: async function(token, newPassword) {
            const response = await fetch(`${AleyAPI.baseUrl}/auth/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: newPassword })
            });
            
            return AleyAPI._handleResponse(response);
        }
    },
    
    // User methods
    User: {
        // Get current user info
        getCurrentUser: async function() {
            const response = await fetch(`${AleyAPI.baseUrl}/users/me`, {
                method: 'GET',
                headers: {
                    ...AleyAPI._getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            });
            
            return AleyAPI._handleResponse(response);
        },
        
        // Get user by ID
        getUserById: async function(userId) {
            const response = await fetch(`${AleyAPI.baseUrl}/users/${userId}`, {
                method: 'GET'
            });
            
            return AleyAPI._handleResponse(response);
        },
        
        // Update user profile
        updateProfile: async function(userData) {
            // Clone userData object to avoid modifying the original object
            const updateData = { ...userData };
            
            // Đảm bảo chỉ dùng profile-bio, xóa trường profileBio nếu có
            if ('profileBio' in updateData) {
                delete updateData.profileBio;
            }
            
            console.log('Sending update data to server:', updateData);
            
            const response = await fetch(`${AleyAPI.baseUrl}/users/update`, {
                method: 'PUT',
                headers: {
                    ...AleyAPI._getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            
            return AleyAPI._handleResponse(response);
        },
        
        // Search users
        searchUsers: async function(query, page = 1, limit = 10) {
            const response = await fetch(`${AleyAPI.baseUrl}/users/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    ...AleyAPI._getAuthHeader()
                }
            });
            
            return AleyAPI._handleResponse(response);
        },
        
        // List users (with pagination)
        listUsers: async function(page = 1, limit = 10) {
            const response = await fetch(`${AleyAPI.baseUrl}/users/list?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    ...AleyAPI._getAuthHeader()
                }
            });
            
            return AleyAPI._handleResponse(response);
        }
    }
};

/**
 * Module quản lý các chức năng liên quan đến bài viết
 */
const postService = {
    // Sử dụng baseUrl từ AleyAPI nếu tồn tại, ngược lại sử dụng mặc định
    baseUrl: (typeof AleyAPI !== 'undefined') ? AleyAPI.baseUrl : 'http://localhost:5000/api',
    
    /**
     * Utility function to handle API response and check for token expiration
     * @param {Response} response - The fetch API response
     * @returns {Promise} - Resolved with data or rejected with error
     */
    _handleApiResponse: function(response) {
        // Check for token expiration
        if (response.status === 401) {
            console.log('Token expired or invalid. Logging out...');
            // Clear the token from local storage
            localStorage.removeItem('aley_token');
            localStorage.removeItem('aley_user_avatar');
            localStorage.removeItem('aley_user_name');
            
            // Show notification and redirect if AleyAPI is available
            if (typeof AleyAPI !== 'undefined' && AleyAPI._showExpiredTokenNotification) {
                AleyAPI._showExpiredTokenNotification();
            } else {
                // Simple notification if AleyAPI is not available
                const notification = document.createElement('div');
                notification.style.position = 'fixed';
                notification.style.top = '0';
                notification.style.left = '0';
                notification.style.width = '100%';
                notification.style.padding = '15px';
                notification.style.backgroundColor = '#f8d7da';
                notification.style.color = '#721c24';
                notification.style.textAlign = 'center';
                notification.style.zIndex = '9999';
                notification.textContent = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại...';
                document.body.prepend(notification);
            }
            
            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
            
            return Promise.reject({ message: 'Session expired' });
        }
        
        // Normal response handling
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    },
    
    /**
     * Tạo bài viết mới
     * @param {Object} postData - Dữ liệu bài viết
     * @param {string} postData.content - Nội dung bài viết
     * @param {File[]} postData.attachments - Mảng các file đính kèm
     * @param {Object} postData.emotion - Cảm xúc
     * @param {string} postData.location - Vị trí
     * @param {string} postData.privacy - Quyền riêng tư ('public', 'friends', 'private')
     * @param {Function} progressCallback - Callback nhận thông tin về tiến độ upload
     * @returns {Promise<Object>} - Thông tin bài viết đã tạo
     */
    createPost: function(postData, progressCallback) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            
            // Thêm nội dung văn bản nếu có
            if (postData.content) {
                formData.append('content', postData.content);
            }
            
            // Thêm tệp đính kèm nếu có
            if (postData.attachments && postData.attachments.length > 0) {
                postData.attachments.forEach(file => {
                    formData.append('attachments[]', file);
                });
            }
            
            // Thêm cảm xúc nếu có
            if (postData.emotion) {
                formData.append('emotion', JSON.stringify(postData.emotion));
            }
            
            // Thêm vị trí nếu có
            if (postData.location) {
                formData.append('location', postData.location);
            }
            
            // Thêm quyền riêng tư
            formData.append('privacy', postData.privacy || 'public');
            
            // Sử dụng XMLHttpRequest để theo dõi tiến độ
            const xhr = new XMLHttpRequest();
            
            // Theo dõi tiến độ tải lên
            if (progressCallback && typeof progressCallback === 'function') {
                xhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        const percentComplete = Math.round((e.loaded / e.total) * 100);
                        progressCallback(percentComplete);
                    }
                });
            }
            
            xhr.addEventListener('load', function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        reject({
                            message: 'Lỗi phân tích phản hồi từ máy chủ',
                            status: xhr.status
                        });
                    }
                } else {
                    try {
                        const error = JSON.parse(xhr.responseText);
                        
                        // Check for token expiration (401 Unauthorized)
                        if (xhr.status === 401) {
                            console.log('Token expired or invalid during post operation. Logging out...');
                            // Clear the token from local storage
                            localStorage.removeItem('aley_token');
                            localStorage.removeItem('aley_user_avatar');
                            localStorage.removeItem('aley_user_name');
                            
                            // Show notification and redirect
                            if (typeof AleyAPI !== 'undefined' && AleyAPI._showExpiredTokenNotification) {
                                AleyAPI._showExpiredTokenNotification();
                            }
                            
                            // Redirect to login page after a short delay
                            setTimeout(() => {
                                window.location.href = '/index.html';
                            }, 1500);
                        }
                        
                        reject(error);
                    } catch (e) {
                        reject({
                            message: 'Đã xảy ra lỗi khi tạo bài viết',
                            status: xhr.status
                        });
                    }
                }
            });
            
            xhr.addEventListener('error', function() {
                reject({
                    message: 'Lỗi kết nối đến máy chủ',
                    status: 0
                });
            });
            
            xhr.addEventListener('abort', function() {
                reject({
                    message: 'Yêu cầu đã bị hủy',
                    status: 0
                });
            });
            
            xhr.open('POST', `${this.baseUrl}/posts`);
            
            // Thêm token xác thực từ localStorage (nếu có)
            const token = localStorage.getItem('aley_token');
            if (token) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            } else {
                console.warn('Token not found when creating post');
            }
            
            xhr.send(formData);
        });
    },
    
    /**
     * Lấy danh sách bài viết
     * @param {number} page - Số trang
     * @param {number} limit - Số lượng bài viết mỗi trang
     * @returns {Promise<Object>} - Danh sách bài viết công khai
     */
    getPosts: function(page = 1, limit = 10) {
        return fetch(`${this.baseUrl}/posts/list?page=${page}&limit=${limit}`)
            .then(response => this._handleApiResponse(response));
    },
    
    /**
     * Lấy feed bài viết cho người dùng đã đăng nhập
     * @param {number} page - Số trang
     * @param {number} limit - Số lượng bài viết mỗi trang
     * @returns {Promise<Object>} - Feed bài viết
     */
    getFeed: function(page = 1, limit = 10) {
        const token = localStorage.getItem('aley_token');
        if (!token) {
            return Promise.reject({ message: 'User not authenticated' });
        }
        
        return fetch(`${this.baseUrl}/posts/feed?page=${page}&limit=${limit}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(response => this._handleApiResponse(response));
    },
    
    /**
     * Lấy bài viết công khai và của bạn bè
     * @param {number} page - Số trang
     * @param {number} limit - Số lượng bài viết mỗi trang
     * @param {string} sort - Kiểu sắp xếp ('newest', 'popular')
     * @returns {Promise<Object>} - Danh sách bài viết công khai và của bạn bè
     */
    getPublicAndFriendsPosts: function(page = 1, limit = 10, sort = 'newest') {
        const token = localStorage.getItem('aley_token');
        if (!token) {
            return Promise.reject({ message: 'User not authenticated' });
        }
        
        return fetch(`${this.baseUrl}/posts/public-and-friends?page=${page}&limit=${limit}&sort=${sort}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(response => this._handleApiResponse(response))
            .then(response => {
                // Chuyển đổi trường tên từ API mới sang định dạng cũ
                if (response.success && response.data && response.data.posts) {
                    response.data.posts = response.data.posts.map(post => {
                        // Xử lý media để đảm bảo URL đúng định dạng
                        let processedMedia = [];
                        if (post.media && Array.isArray(post.media)) {
                            processedMedia = post.media.map(media => {
                                // Nếu media là string (chỉ là ID), chuyển đổi thành đối tượng với URL đầy đủ
                                if (typeof media === 'string') {
                                    return {
                                        id: media,
                                        url: `${this.baseUrl}/media/${media}`,
                                        type: this._guessMediaType(media)
                                    };
                                }
                                
                                // Nếu media là object nhưng không có URL đầy đủ
                                if (typeof media === 'object') {
                                    // Nếu URL đã tồn tại và là URL đầy đủ (bắt đầu bằng http/https), giữ nguyên
                                    if (media.url && (media.url.startsWith('http://') || media.url.startsWith('https://'))) {
                                        return media;
                                    }
                                    
                                    // Nếu có ID nhưng không có URL hoặc URL không đầy đủ
                                    const mediaId = media.id || media._id;
                                    if (mediaId) {
                                        return {
                                            ...media,
                                            id: mediaId,
                                            url: `${this.baseUrl}/media/${mediaId}`,
                                            type: media.type || this._guessMediaType(mediaId)
                                        };
                                    }
                                }
                                
                                return media; // Trả về nguyên bản nếu không thể xử lý
                            });
                        }
                        
                        return {
                            post_id: post.id || post._id,
                            content: post.content,
                            created_at: post.createdAt || post.created_at,
                            privacy: post.visibility || post.privacy,
                            likes_count: post.likeCount || post.likes_count || 0,
                            comments_count: post.commentCount || post.comments_count || 0,
                            shares_count: post.shareCount || post.shares_count || 0,
                            author: {
                                id: post.author.id || post.author._id,
                                user_id: post.author.id || post.author._id,
                                _id: post.author.id || post.author._id,
                                name: post.author.name || post.author.fullName,
                                avatar: post.author.avatar,
                                email: post.author.email || post.author.username
                            },
                            media: processedMedia,
                            is_liked: post.isLiked || post.is_liked || false,
                            is_own_post: post.author.id === localStorage.getItem('aley_user_id')
                        };
                    });
                }
                return response;
            });
    },
    
    /**
     * Utility function to guess media type based on file extension
     * @private
     */
    _guessMediaType: function(filename) {
        if (!filename) return 'image'; // Mặc định là image
        
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
            return 'image';
        } else if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext)) {
            return 'video';
        } else if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) {
            return 'audio';
        }
        
        // Nếu phần mở rộng không được nhận dạng, kiểm tra chuỗi ID
        if (filename.includes('image')) return 'image';
        if (filename.includes('video')) return 'video';
        if (filename.includes('audio')) return 'audio';
        
        return 'image'; // Mặc định là image nếu không xác định được
    },
    
    /**
     * Lấy bài viết của một người dùng cụ thể
     * @param {string} userId - ID của người dùng
     * @param {number} page - Số trang
     * @param {number} limit - Số lượng bài viết mỗi trang
     * @returns {Promise<Object>} - Danh sách bài viết của người dùng
     */
    getUserPosts: function(userId, page = 1, limit = 10) {
        const token = localStorage.getItem('aley_token');
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        
        return fetch(`${this.baseUrl}/posts/user/${userId}?page=${page}&limit=${limit}`, {
            headers: headers
        })
            .then(response => this._handleApiResponse(response));
    },
    
    /**
     * Lấy bài viết của người dùng đang đăng nhập
     * @param {number} page - Số trang
     * @param {number} limit - Số lượng bài viết mỗi trang
     * @returns {Promise<Object>} - Danh sách bài viết của người dùng đang đăng nhập
     */
    getMyPosts: function(page = 1, limit = 10) {
        const token = localStorage.getItem('aley_token');
        if (!token) {
            return Promise.reject({ message: 'User not authenticated' });
        }
        
        // Bỏ qua việc thử API "/posts/me", đi thẳng đến phương pháp lọc feed
        return this.getFeed(page, limit)
            .then(feedResponse => {
                if (feedResponse.data && feedResponse.data.posts) {
                    // Lấy thông tin người dùng hiện tại để lọc feed
                    return fetch(`${this.baseUrl}/users/me`, {
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    })
                    .then(userResponse => this._handleApiResponse(userResponse))
                    .then(userData => {
                        // Lọc feed để chỉ lấy bài viết của người dùng hiện tại
                        const filteredPosts = feedResponse.data.posts.filter(post => 
                            post.author && 
                            (post.author.email === userData.email || 
                             post.author.name === userData.fullName)
                        );
                        
                        // Tạo đối tượng phản hồi với định dạng API
                        return {
                            success: true,
                            data: {
                                posts: filteredPosts,
                                total: filteredPosts.length,
                                page: page,
                                limit: limit
                            }
                        };
                    });
                }
                return feedResponse;
            });
    },
    
    /**
     * Thích hoặc bỏ thích bài viết
     * @param {string} postId - ID của bài viết
     * @returns {Promise<Object>} - Thông tin về trạng thái thích
     */
    toggleLike: function(postId) {
        const token = localStorage.getItem('aley_token');
        if (!token) {
            return Promise.reject({ message: 'User not authenticated' });
        }
        
        return fetch(`${this.baseUrl}/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(response => this._handleApiResponse(response));
    },
    
    /**
     * Xóa bài viết
     * @param {string} postId - ID của bài viết
     * @returns {Promise<Object>} - Thông báo kết quả
     */
    deletePost: function(postId) {
        const token = localStorage.getItem('aley_token');
        if (!token) {
            return Promise.reject({ message: 'User not authenticated' });
        }
        
        return fetch(`${this.baseUrl}/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(response => this._handleApiResponse(response));
    },
    
    /**
     * Cập nhật bài viết
     * @param {string} postId - ID của bài viết
     * @param {Object} updateData - Dữ liệu cần cập nhật
     * @returns {Promise<Object>} - Thông báo kết quả
     */
    updatePost: function(postId, updateData) {
        const token = localStorage.getItem('aley_token');
        if (!token) {
            return Promise.reject({ message: 'User not authenticated' });
        }
        
        return fetch(`${this.baseUrl}/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(updateData)
        })
            .then(response => this._handleApiResponse(response));
    }
};

/**
 * Service cho các chức năng liên quan đến bạn bè
 */
const friendService = {
    baseUrl: (typeof AleyAPI !== 'undefined') ? AleyAPI.baseUrl : 'http://localhost:5000/api',
    
    /**
     * Lấy header xác thực
     * @returns {Object} - Header xác thực
     */
    _getAuthHeader: function() {
        const token = localStorage.getItem('aley_token');
        return token ? { 'Authorization': 'Bearer ' + token } : {};
    },
    
    /**
     * Xử lý phản hồi từ API
     * @param {Response} response - Phản hồi từ API
     * @returns {Promise} - Promise chứa kết quả API
     */
    _handleApiResponse: async function(response) {
        try {
            const data = await response.json();
            
            if (!response.ok) {
                console.error('API error:', data);
                
                // Tạo lỗi chi tiết hơn với thông tin từ phản hồi API
                const error = new Error(data.error?.message || data.message || 'Something went wrong');
                
                // Sao chép các thuộc tính từ data.error vào đối tượng lỗi để sử dụng sau này
                if (data.error) {
                    error.code = data.error.code;
                    error.status = response.status;
                    
                    // Đối với lỗi 409 CONFLICT khi gửi lời mời kết bạn, cố gắng lấy request_id
                    if (response.status === 409 && data.error.code === 'REQUEST_ALREADY_SENT') {
                        // Nếu có dữ liệu bổ sung trong phản hồi, ví dụ như request_id
                        if (data.data && data.data.request_id) {
                            error.request_id = data.data.request_id;
                        }
                    }
                }
                
                throw error;
            }
            
            return data;
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    },
    
    /**
     * Kiểm tra trạng thái kết bạn với một người dùng
     * @param {string} userId - ID của người dùng cần kiểm tra
     * @returns {Promise} - Promise chứa kết quả API
     */
    checkFriendshipStatus: async function(userId) {
        console.log('Checking friendship status for user', userId);
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            
            // Get auth token, show warning if not available
            const authToken = localStorage.getItem('aley_token');
            if (!authToken) {
                console.warn('No auth token available for friendship status check');
            } else {
                console.log('Auth token found, checking friendship status with authentication');
            }
            
            const authHeaders = this._getAuthHeader();
            console.log('Request headers:', authHeaders);
            
            const url = `${this.baseUrl}/friends/status/${userId}`;
            console.log('Fetching friendship status from URL:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    ...authHeaders
                }
            });
            
            console.log('Raw API response status:', response.status);
            
            // Handle response including error cases
            if (!response.ok) {
                console.error(`API Error: ${response.status} ${response.statusText}`);
                // Still try to parse the error response
                try {
                    const errorData = await response.json();
                    console.error('Error details:', errorData);
                    
                    // Return a standardized error response
                    return {
                        success: false,
                        error: errorData,
                        data: {
                            status: 'not_friends', // Default to not_friends on error
                        }
                    };
                } catch (parseError) {
                    console.error('Could not parse error response:', parseError);
                }
            }
            
            // Parse successful response
            const result = await this._handleApiResponse(response);
            console.log('Processed API response:', result);
            return result;
        } catch (error) {
            console.error('Error checking friendship status:', error);
            // Return a default response on error rather than throwing
            return {
                success: false,
                error: { message: error.message },
                data: {
                    status: 'not_friends', // Default to not_friends on error
                }
            };
        }
    },
    
    /**
     * Gửi lời mời kết bạn
     * @param {string} recipientId - ID của người nhận lời mời
     * @returns {Promise} - Promise chứa kết quả API
     */
    sendFriendRequest: async function(recipientId) {
        console.log(`Sending friend request to user ID: ${recipientId}`);
        
        try {
            const response = await fetch(`${this.baseUrl}/friends/requests`, {
                method: 'POST',
                headers: {
                    ...this._getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipient_id: recipientId
                })
            });
            
            // Before handling the response normally, check if we have a 200 OK response
            // which indicates the other user's request was automatically accepted
            if (response.status === 200) {
                console.log('Automatically accepted existing friend request from the recipient');
                const data = await response.json();
                
                // Add a flag to indicate this was an auto-accept case
                if (data.success) {
                    data.wasAutoAccepted = true;
                }
                
                return data;
            }
            
            return this._handleApiResponse(response);
        } catch (error) {
            console.error('Error sending friend request:', error);
            throw error;
        }
    },
    
    /**
     * Hủy lời mời kết bạn
     * @param {string} requestId - ID của lời mời kết bạn cần hủy
     * @returns {Promise} - Promise chứa kết quả API
     */
    cancelFriendRequest: async function(requestId) {
        console.log(`Canceling friend request ID: ${requestId}`);
        
        const response = await fetch(`${this.baseUrl}/friends/requests/${requestId}`, {
            method: 'DELETE',
            headers: {
                ...this._getAuthHeader()
            }
        });
        
        return this._handleApiResponse(response);
    },
    
    /**
     * Chấp nhận lời mời kết bạn
     * @param {string} requestId - ID của lời mời kết bạn cần chấp nhận
     * @returns {Promise} - Promise chứa kết quả API
     */
    acceptFriendRequest: async function(requestId) {
        console.log(`Accepting friend request ID: ${requestId}`);
        
        const response = await fetch(`${this.baseUrl}/friends/requests/${requestId}/accept`, {
            method: 'POST',
            headers: {
                ...this._getAuthHeader()
            }
        });
        
        return this._handleApiResponse(response);
    },
    
    /**
     * Hủy kết bạn với một người dùng
     * @param {string} friendId - ID của người dùng cần hủy kết bạn
     * @returns {Promise} - Promise chứa kết quả API
     */
    unfriendUser: async function(friendId) {
        console.log(`Unfriending user ID: ${friendId}`);
        
        try {
            const response = await fetch(`${this.baseUrl}/friends/${friendId}`, {
                method: 'DELETE',
                headers: {
                    ...this._getAuthHeader()
                }
            });
            
            return await this._handleApiResponse(response);
        } catch (error) {
            console.error('Error unfriending user:', error);
            throw error;
        }
    },
    
    /**
     * Lấy danh sách lời mời kết bạn đã nhận
     * @param {number} page - Số trang
     * @param {number} limit - Số lượng kết quả mỗi trang
     * @returns {Promise} - Promise chứa kết quả API
     */
    getReceivedFriendRequests: async function(page = 1, limit = 20) {
        const response = await fetch(`${this.baseUrl}/friends/requests/received?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: {
                ...this._getAuthHeader()
            }
        });
        
        return this._handleApiResponse(response);
    },
    
    /**
     * Lấy danh sách lời mời kết bạn đã gửi
     * @param {number} page - Số trang
     * @param {number} limit - Số lượng kết quả mỗi trang
     * @returns {Promise} - Promise chứa kết quả API
     */
    getSentFriendRequests: async function(page = 1, limit = 20) {
        const response = await fetch(`${this.baseUrl}/friends/requests/sent?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: {
                ...this._getAuthHeader()
            }
        });
        
        return this._handleApiResponse(response);
    },
    
    /**
     * Lấy danh sách gợi ý kết bạn
     * @param {number} page - Số trang
     * @param {number} limit - Số lượng kết quả mỗi trang
     * @param {string} search - Từ khóa tìm kiếm (không bắt buộc)
     * @returns {Promise} - Promise chứa kết quả API
     */
    getFriendSuggestions: async function(page = 1, limit = 20, search = '') {
        let url = `${this.baseUrl}/friends/suggestions?page=${page}&limit=${limit}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                ...this._getAuthHeader()
            }
        });
        
        return this._handleApiResponse(response);
    }
};

// Thêm module postService vào apiService
if (typeof apiService !== 'undefined') {
    apiService.posts = postService;
} else {
    // Nếu apiService chưa được định nghĩa, tạo mới
    const apiService = {
        posts: postService
    };
    
    // Expose apiService to global scope
    window.apiService = apiService;
}

// Thêm friendService vào đối tượng apiService để sử dụng từ bất kỳ tệp nào
if (typeof apiService === 'undefined') {
    window.apiService = {};
}

apiService.friends = friendService;
