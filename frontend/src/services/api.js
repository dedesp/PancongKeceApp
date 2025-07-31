// API Configuration and Base Service
const API_BASE_URL = 'http://localhost:3000/api';

// Mock token for development - in production this should come from auth
const getAuthToken = () => {
  // For development, always return a mock token
  if (!localStorage.getItem('authToken')) {
    localStorage.setItem('authToken', 'mock-token-for-development');
  }
  return localStorage.getItem('authToken') || 'mock-token-for-development';
};

// Base API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // If we can't connect to the server, throw a connection error
    if (!response.ok && response.status === 0) {
      throw new Error('Connection refused - using mock data');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }
    
    return data;
  } catch (error) {
    // Check if it's a network error (connection refused)
    if (error.message.includes('fetch') || error.message.includes('Connection refused')) {
      console.warn('Backend server not available, using mock data');
      throw new Error('BACKEND_UNAVAILABLE');
    }
    console.error('API Error:', error);
    throw error;
  }
};

// Product API calls
export const productAPI = {
  // Get all products with optional filters
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/products${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get product by ID
  getById: (id) => apiCall(`/products/${id}`),
  
  // Create new product
  create: (productData) => apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
  
  // Update product
  update: (id, productData) => apiCall(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  }),
  
  // Delete product
  delete: (id) => apiCall(`/products/${id}`, {
    method: 'DELETE',
  }),
};

// Category API calls
export const categoryAPI = {
  getAll: () => apiCall('/categories'),
  create: (categoryData) => apiCall('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  }),
};

// Dashboard API calls
export const dashboardAPI = {
  getStats: () => apiCall('/dashboard/stats'),
  getRecentTransactions: () => apiCall('/dashboard/recent-transactions'),
  getTopProducts: () => apiCall('/dashboard/top-products'),
};

// Transaction API calls
export const transactionAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/transactions${queryString ? `?${queryString}` : ''}`);
  },
  create: (transactionData) => apiCall('/transactions', {
    method: 'POST',
    body: JSON.stringify(transactionData),
  }),
};

export default {
  productAPI,
  categoryAPI,
  dashboardAPI,
  transactionAPI,
};