// API Configuration for Pancong Kece App
const API_CONFIG = {
    // Automatically detect environment - Netlify deployment
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : '/.netlify/functions/server/api',
    
    // Timeout configuration
    TIMEOUT: 30000, // 30 seconds
    
    // Headers
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// API Helper functions
const API = {
    // Get auth token from localStorage
    getToken() {
        return localStorage.getItem('authToken');
    },
    
    // Get headers with auth token
    getAuthHeaders() {
        const token = this.getToken();
        return {
            ...API_CONFIG.DEFAULT_HEADERS,
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    },
    
    // Base fetch function with error handling
    async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: this.getAuthHeaders(),
            ...options
        };
        
        try {
            console.log(`API Request: ${config.method} ${url}`);
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`API Response:`, data);
            
            return data;
        } catch (error) {
            console.error(`API Error for ${endpoint}:`, error);
            throw error;
        }
    },
    
    // GET request
    async get(endpoint) {
        return this.request(endpoint);
    },
    
    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
};

// Specific API endpoints
const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        VERIFY: '/auth/verify'
    },
    
    // Products
    PRODUCTS: {
        LIST: '/products',
        CREATE: '/products',
        UPDATE: (id) => `/products/${id}`,
        DELETE: (id) => `/products/${id}`,
        GET: (id) => `/products/${id}`
    },
    
    // Customers
    CUSTOMERS: {
        LIST: '/customers',
        CREATE: '/customers',
        UPDATE: (id) => `/customers/${id}`,
        DELETE: (id) => `/customers/${id}`,
        GET: (id) => `/customers/${id}`
    },
    
    // Transactions
    TRANSACTIONS: {
        LIST: '/transactions',
        CREATE: '/transactions',
        UPDATE: (id) => `/transactions/${id}`,
        DELETE: (id) => `/transactions/${id}`,
        GET: (id) => `/transactions/${id}`
    },
    
    // Dashboard
    DASHBOARD: {
        STATS: '/dashboard/stats',
        CHARTS: '/dashboard/charts'
    },
    
    // Health check
    HEALTH: '/health'
};

// Export for global use
window.API_CONFIG = API_CONFIG;
window.API = API;
window.API_ENDPOINTS = API_ENDPOINTS;