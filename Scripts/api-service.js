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
