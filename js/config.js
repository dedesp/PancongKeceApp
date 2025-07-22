// Pancong Kece - Core Configuration and Settings
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
const popularProducts = {
    'F1': { id: 1, name: 'Kopi Americano' },
    'F2': { id: 2, name: 'Pancong Original' },
    'F3': { id: 3, name: 'Latte' },
    'F4': { id: 4, name: 'Cappuccino' },
    'F5': { id: 5, name: 'Pancong Keju' },
    'F6': { id: 6, name: 'Green Tea Latte' },
    'F7': { id: 7, name: 'Pancong Coklat' },
    'F8': { id: 8, name: 'Espresso' },
    'F9': { id: 9, name: 'Roti Bakar' },
    'F10': { id: 10, name: 'Es Teh' },
    'F11': { id: 11, name: 'Nasi Goreng' },
    'F12': { id: 12, name: 'Ayam Geprek' }
};

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
        name: "Pancong Original",
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
        name: "Pancong Keju",
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
        name: "Pancong Coklat",
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
        cart
    };
}
