// Sajati Smart System - Core Configuration and Settings
// This file contains all global settings and configurations

// Tax and service settings
let taxSettings = {
    ppn: { percentage: 11, active: true },
    service: { percentage: 5, active: true }
};

// Discount and rounding settings
let appliedDiscount = null;
let roundingSettings = {
    active: true,
    method: 'nearest',
    increment: 100
};

// Customer and loyalty settings
let selectedCustomer = null;
let loyaltySettings = {
    earnRate: 1, // poin per Rp 1000
    redemptionRate: 1000 // poin untuk Rp 1000 diskon
};

// Cafe operation status
let cafeStatus = {
    isOpen: true,
    openTime: '08:00',
    openBy: 'Andi Pratama'
};

// Payment method selection
let selectedPaymentMethod = 'cash';

// Popular products mapping for keyboard shortcuts (F1-F12)
// This will be dynamically updated based on last month's sales data
let popularProducts = {
    'F1': { id: null, name: 'Loading...' },
    'F2': { id: null, name: 'Loading...' },
    'F3': { id: null, name: 'Loading...' },
    'F4': { id: null, name: 'Loading...' },
    'F5': { id: null, name: 'Loading...' },
    'F6': { id: null, name: 'Loading...' },
    'F7': { id: null, name: 'Loading...' },
    'F8': { id: null, name: 'Loading...' },
    'F9': { id: null, name: 'Loading...' },
    'F10': { id: null, name: 'Loading...' },
    'F11': { id: null, name: 'Loading...' },
    'F12': { id: null, name: 'Loading...' }
};

// Last update timestamp for popular products
let lastPopularProductsUpdate = localStorage.getItem('lastPopularProductsUpdate') || null;

// Function to get top products from last month
async function getTopProductsLastMonth() {
    try {
        // Get top 12 products from last month
        // Using 'month' period which gets data from last 30 days
        const response = await API.get(`${API_ENDPOINTS.DASHBOARD.TOP_PRODUCTS}?period=month&limit=12`);
        
        if (response.status === 'success' && response.data) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching top products:', error);
        // Fallback: return empty array if API fails
        return [];
    }
}

// Function to update popular products shortcuts
async function updatePopularProductsShortcuts() {
    try {
        const topProducts = await getTopProductsLastMonth();
        const functionKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];
        
        // Reset all shortcuts
        functionKeys.forEach(key => {
            popularProducts[key] = { id: null, name: 'Tidak tersedia' };
        });
        
        // Assign top products to function keys
        topProducts.forEach((product, index) => {
            if (index < 12) {
                const key = functionKeys[index];
                popularProducts[key] = {
                    id: product.product_id,
                    name: product.product_name
                };
            }
        });
        
        // Save update timestamp
        lastPopularProductsUpdate = new Date().toISOString();
        localStorage.setItem('lastPopularProductsUpdate', lastPopularProductsUpdate);
        localStorage.setItem('popularProducts', JSON.stringify(popularProducts));
        
        console.log('Popular products shortcuts updated:', popularProducts);
        
        // Trigger event for UI update if needed
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('popularProductsUpdated', { detail: popularProducts }));
        }
        
        return popularProducts;
    } catch (error) {
        console.error('Error updating popular products shortcuts:', error);
        return popularProducts;
    }
}

// Function to check if update is needed (monthly)
function shouldUpdatePopularProducts() {
    if (!lastPopularProductsUpdate) return true;
    
    const lastUpdate = new Date(lastPopularProductsUpdate);
    const now = new Date();
    
    // Check if it's a new month
    return lastUpdate.getMonth() !== now.getMonth() || lastUpdate.getFullYear() !== now.getFullYear();
}

// Auto-update popular products on page load if needed
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async () => {
        // Load saved popular products from localStorage
        const savedPopularProducts = localStorage.getItem('popularProducts');
        if (savedPopularProducts) {
            try {
                popularProducts = JSON.parse(savedPopularProducts);
            } catch (error) {
                console.error('Error parsing saved popular products:', error);
            }
        }
        
        // Check if update is needed
        if (shouldUpdatePopularProducts()) {
            console.log('Updating popular products shortcuts for new month...');
            await updatePopularProductsShortcuts();
        }
    });
    
    // Set up monthly auto-update (check every hour)
    setInterval(() => {
        if (shouldUpdatePopularProducts()) {
            console.log('Monthly update triggered for popular products shortcuts...');
            updatePopularProductsShortcuts();
        }
    }, 60 * 60 * 1000); // Check every hour
}

// Discount presets
const discountPresets = [
    { code: 'MEMBER10', name: '10% Member Discount', type: 'percentage', value: 10 },
    { code: 'WEEKEND15', name: '15% Weekend Special', type: 'percentage', value: 15 },
    { code: 'BIRTHDAY20', name: '20% Birthday Special', type: 'percentage', value: 20 },
    { code: 'SENIOR5K', name: 'Senior Discount', type: 'fixed', value: 5000 },
    { code: 'STUDENT5', name: '5% Student Discount', type: 'percentage', value: 5 }
];

// Mock data for menu items
const menuItems = [
    {
        id: 1,
        name: "Kopi Americano",
        price: 15000,
        image: "https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1653411712105-31fdd4e39c40",
        category: "minuman"
    },
    {
        id: 2,
        name: "Sajati Original",
        price: 12000,
        image: "https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1721027322774-b1479ea07627",
        category: "makanan"
    },
    {
        id: 3,
        name: "Latte",
        price: 18000,
        image: "https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1549045108-1817700573a3",
        category: "minuman"
    },
    {
        id: 4,
        name: "Cappuccino",
        price: 17000,
        image: "https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1640244444369-ca21d61d7a05",
        category: "minuman"
    },
    {
        id: 5,
        name: "Sajati Keju",
        price: 15000,
        image: "https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1713700321951-d79e5c39ea93",
        category: "makanan"
    },
    {
        id: 6,
        name: "Green Tea Latte",
        price: 20000,
        image: "https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1739224054384-ec1343840e67",
        category: "minuman"
    },
    {
        id: 7,
        name: "Sajati Coklat",
        price: 14000,
        image: "https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1498604132755-751b73a22ec9",
        category: "makanan"
    },
    {
        id: 8,
        name: "Espresso",
        price: 13000,
        image: "https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1641816481191-d4522e79ba38",
        category: "minuman"
    }
];

// Cart array
let cart = [];

// Export all global variables and constants for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        taxSettings,
        appliedDiscount,
        roundingSettings,
        selectedCustomer,
        loyaltySettings,
        cafeStatus,
        selectedPaymentMethod,
        popularProducts,
        discountPresets,
        menuItems,
        cart,
        getTopProductsLastMonth,
        updatePopularProductsShortcuts,
        shouldUpdatePopularProducts
    };
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.getTopProductsLastMonth = getTopProductsLastMonth;
    window.updatePopularProductsShortcuts = updatePopularProductsShortcuts;
    window.shouldUpdatePopularProducts = shouldUpdatePopularProducts;
}
