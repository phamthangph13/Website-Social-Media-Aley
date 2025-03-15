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
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
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
            const response = await fetch(`${AleyAPI.baseUrl}/users/update`, {
                method: 'PUT',
                headers: {
                    ...AleyAPI._getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            return AleyAPI._handleResponse(response);
        },
        
        // Search users
        searchUsers: async function(query, page = 1, limit = 10) {
            const response = await fetch(`${AleyAPI.baseUrl}/users/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
                method: 'GET'
            });
            
            return AleyAPI._handleResponse(response);
        },
        
        // List users (with pagination)
        listUsers: async function(page = 1, limit = 10) {
            const response = await fetch(`${AleyAPI.baseUrl}/users/list?page=${page}&limit=${limit}`, {
                method: 'GET'
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
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => Promise.reject(err));
                }
                return response.json();
            });
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
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => Promise.reject(err));
                }
                return response.json();
            });
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
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => Promise.reject(err));
                }
                return response.json();
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
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => Promise.reject(err));
                }
                return response.json();
            });
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
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => Promise.reject(err));
                }
                return response.json();
            });
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
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => Promise.reject(err));
                }
                return response.json();
            });
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
