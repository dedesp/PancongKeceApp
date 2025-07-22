// Pancong Kece - Keyboard Shortcuts Module
// Enhanced keyboard shortcuts for POS operations

// Initialize keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', handleKeyboardShortcut);
    
    // Show shortcuts notification on POS section load
    setTimeout(() => {
        if (document.getElementById('pos').classList.contains('active')) {
            showKeyboardShortcutsNotification();
        }
    }, 1000);
}

// Main keyboard shortcut handler
function handleKeyboardShortcut(e) {
    // Only process shortcuts when POS section is active
    if (!document.getElementById('pos') || !document.getElementById('pos').classList.contains('active')) {
        return;
    }

    // Prevent default browser shortcuts
    if (e.key.startsWith('F') && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
    }

    // Handle F1-F12 for popular products
    if (e.key >= 'F1' && e.key <= 'F12' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        handleProductShortcut(e.key);
        return;
    }

    // Handle other shortcuts
    if (e.ctrlKey) {
        switch(e.key.toLowerCase()) {
            case 'p': // Ctrl+P - Process Payment
                e.preventDefault();
                if (cart.length > 0) {
                    focusPaymentSection();
                    showSuccess('Ready to process payment! Press Enter to confirm.');
                }
                break;
            case 'd': // Ctrl+D - Apply Discount
                e.preventDefault();
                if (cart.length > 0) {
                    showDiscountModal();
                }
                break;
            case 'n': // Ctrl+N - New Transaction
                e.preventDefault();
                clearCart();
                showSuccess('New transaction started');
                break;
            case 'f': // Ctrl+F - Find Customer
                e.preventDefault();
                // Focus on customer search if available
                const customerSearch = document.querySelector('#customerSearch');
                if (customerSearch) {
                    customerSearch.focus();
                }
                break;
        }
    }

    // Handle ESC key
    if (e.key === 'Escape') {
        if (cart.length > 0) {
            if (confirm('Cancel current transaction?')) {
                clearCart();
                showSuccess('Transaction cancelled');
            }
        }
    }

    // Handle Enter key for payment processing
    if (e.key === 'Enter' && cart.length > 0) {
        const paymentSection = document.querySelector('.payment-methods');
        if (paymentSection && paymentSection.classList.contains('keyboard-focus')) {
            processPayment();
        }
    }
}

// Handle F1-F12 product shortcuts
function handleProductShortcut(key) {
    const product = popularProducts[key];
    if (product) {
        const menuItem = menuItems.find(item => item.id === product.id);
        if (menuItem) {
            addToCart(menuItem);
            
            // Visual feedback
            highlightMenuItem(menuItem.id);
            showSuccess(`${menuItem.name} added via ${key}!`);
        }
    }
}

// Highlight menu item when added via shortcut
function highlightMenuItem(itemId) {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;
    
    const menuItems = menuGrid.querySelectorAll('.menu-item');
    menuItems.forEach((item, index) => {
        if (menuItems[index] && menuItems[index].querySelector('.item-name')) {
            const itemName = menuItems[index].querySelector('.item-name').textContent;
            const targetItem = window.menuItems.find(mi => mi.id === itemId);
            if (targetItem && itemName === targetItem.name) {
                // Add highlight effect
                item.style.transform = 'scale(1.05)';
                item.style.boxShadow = '0 15px 35px rgba(45, 80, 22, 0.2)';
                item.style.borderColor = '#2d5016';
                
                setTimeout(() => {
                    item.style.transform = '';
                    item.style.boxShadow = '';
                    item.style.borderColor = '';
                }, 800);
            }
        }
    });
}

// Focus payment section with visual feedback
function focusPaymentSection() {
    const paymentMethods = document.querySelector('.payment-methods');
    if (paymentMethods) {
        paymentMethods.classList.add('keyboard-focus');
        paymentMethods.scrollIntoView({ behavior: 'smooth' });
        
        // Remove focus after 3 seconds
        setTimeout(() => {
            paymentMethods.classList.remove('keyboard-focus');
        }, 3000);
    }
}

// Show keyboard shortcuts notification
function showKeyboardShortcutsNotification() {
    // Check if notification already exists
    if (document.querySelector('.shortcuts-notification')) {
        return;
    }

    const notification = document.createElement('div');
    notification.className = 'shortcuts-notification shortcuts-hint';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f0f8f5 0%, #e8f5e8 100%);
        border-left: 4px solid #4a7c59;
        padding: 1rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(45, 80, 22, 0.15);
        z-index: 1001;
        max-width: 300px;
        animation: slideIn 0.5s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <div style="font-weight: bold; color: #2d5016; margin-bottom: 0.5rem;">⌨️ Keyboard Shortcuts Active</div>
                <div style="font-size: 0.85rem; color: #4a7c59; line-height: 1.4;">
                    <div><strong>F1-F12:</strong> Add popular items</div>
                    <div><strong>Ctrl+P:</strong> Process payment</div>
                    <div><strong>Ctrl+D:</strong> Apply discount</div>
                    <div><strong>ESC:</strong> Cancel transaction</div>
                </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: none; 
                border: none; 
                color: #4a7c59; 
                cursor: pointer; 
                font-size: 1.2rem;
                padding: 0;
                margin-left: 10px;
            ">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

// Get shortcut key for a product (used in menu display)
function getShortcutKey(itemId) {
    for (const [key, product] of Object.entries(popularProducts)) {
        if (product.id === itemId) {
            return key;
        }
    }
    return null;
}

// Show discount modal (basic implementation)
function showDiscountModal() {
    // This is a simplified version - in a full implementation this would show a proper modal
    const discountCode = prompt('Enter discount code:');
    if (discountCode) {
        const discount = discountPresets.find(d => d.code.toLowerCase() === discountCode.toLowerCase());
        if (discount) {
            applyDiscount(discount);
            showSuccess(`Discount "${discount.name}" applied!`);
        } else {
            showSuccess('Invalid discount code', 'error');
        }
    }
}

// Apply discount (basic implementation)
function applyDiscount(discount) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discountAmount = 0;
    
    if (discount.type === 'percentage') {
        discountAmount = Math.round(subtotal * (discount.value / 100));
    } else if (discount.type === 'fixed') {
        discountAmount = discount.value;
    }
    
    appliedDiscount = {
        ...discount,
        amount: discountAmount
    };
    
    updateCartDisplay();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeyboardShortcuts);
} else {
    initKeyboardShortcuts();
}

// Export functions for use in other modules
if (typeof window !== 'undefined') {
    window.keyboardShortcuts = {
        initKeyboardShortcuts,
        handleKeyboardShortcut,
        getShortcutKey,
        showKeyboardShortcutsNotification
    };
}
