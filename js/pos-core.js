// Sajati Smart System - POS Core Module
// Core POS functionality including menu, cart, and payment processing

// Initialize POS system
function initPOS() {
    loadMenu();
    setupPaymentMethods();
    updateCartDisplay();
}

// Load menu items with keyboard shortcut indicators
function loadMenu() {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;

    menuGrid.innerHTML = '';
    
    menuItems.forEach(item => {
        const menuItemEl = document.createElement('div');
        menuItemEl.className = 'menu-item';
        
        // Check if this item has a keyboard shortcut
        const shortcutKey = getShortcutKey ? getShortcutKey(item.id) : null;
        const shortcutBadge = shortcutKey ? 
            `<div class="shortcut-badge" style="
                position: absolute; 
                top: 8px; 
                right: 8px; 
                background: #2d5016; 
                color: white; 
                padding: 4px 8px; 
                border-radius: 12px; 
                font-size: 0.7rem; 
                font-weight: bold; 
                z-index: 2;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">${shortcutKey}</div>` : '';
        
        menuItemEl.innerHTML = `
            ${shortcutBadge}
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <div class="item-name">${item.name}</div>
            <div class="item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
        `;
        
        // Add relative positioning to menu item for shortcut badge
        if (shortcutKey) {
            menuItemEl.style.position = 'relative';
            menuItemEl.style.border = '2px solid #e8f5e8';
            menuItemEl.title = `Press ${shortcutKey} to add quickly`;
        }
        
        menuItemEl.addEventListener('click', () => addToCart(item));
        menuGrid.appendChild(menuItemEl);
    });
}

// Cart functionality
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    showSuccess(`${item.name} ditambahkan ke keranjang`);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartDisplay();
}

function clearCart() {
    cart = [];
    appliedDiscount = null;
    selectedCustomer = null;
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const totalAmount = document.getElementById('totalAmount');
    const subtotalDisplay = document.getElementById('subtotalDisplay');
    const subtotalAmount = document.getElementById('subtotalAmount');
    const taxServiceBreakdown = document.getElementById('taxServiceBreakdown');
    
    if (!cartItems || !totalAmount) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #4a7c59; padding: 2rem;">Keranjang kosong</p>';
        totalAmount.textContent = 'Rp 0';
        if (subtotalDisplay) subtotalDisplay.style.display = 'none';
        if (taxServiceBreakdown) taxServiceBreakdown.style.display = 'none';
        return;
    }
    
    let subtotal = 0;
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>
                <div style="font-weight: 600; color: #2d5016;">${item.name}</div>
                <div style="color: #4a7c59; font-size: 0.9rem;">Rp ${item.price.toLocaleString('id-ID')} x ${item.quantity}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: #2d5016; margin-bottom: 0.5rem;">Rp ${itemTotal.toLocaleString('id-ID')}</div>
                <button class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="removeFromCart(${item.id})">
                    <i class="hgi-stroke hgi-shopping-cart-remove-01"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    // Calculate tax and service
    const calculation = calculateTaxAndService(subtotal);
    
    // Show subtotal
    if (subtotalAmount) {
        subtotalAmount.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
        subtotalDisplay.style.display = 'block';
    }
    
    // Show discount breakdown
    const discountDisplay = document.getElementById('discountDisplay');
    if (discountDisplay) {
        if (appliedDiscount) {
            discountDisplay.innerHTML = `
                <div style="padding: 0.5rem; background: #e8f5e8; border-radius: 6px; border-left: 4px solid #4a7c59;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 0.9rem; font-weight: 600; color: #2d5016;">${appliedDiscount.name}</div>
                            <div style="font-size: 0.8rem; color: #4a7c59;">${appliedDiscount.code}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 700; color: #2d5016;">-Rp ${appliedDiscount.amount.toLocaleString('id-ID')}</div>
                            <button onclick="removeDiscount()" style="background: none; border: none; color: #dc3545; font-size: 0.8rem; cursor: pointer;">Hapus</button>
                        </div>
                    </div>
                </div>
            `;
            discountDisplay.style.display = 'block';
        } else {
            discountDisplay.style.display = 'none';
        }
    }
    
    // Show tax and service breakdown
    if (taxServiceBreakdown) {
        let breakdownHTML = '';
        
        if (taxSettings.service.active && taxSettings.service.percentage > 0) {
            breakdownHTML += `
                <div style="display: flex; justify-content: space-between; color: #4a7c59; font-size: 0.9rem;">
                    <span>Service Charge (${taxSettings.service.percentage}%):</span>
                    <span>Rp ${calculation.serviceAmount.toLocaleString('id-ID')}</span>
                </div>
            `;
        }
        
        if (taxSettings.ppn.active && taxSettings.ppn.percentage > 0) {
            breakdownHTML += `
                <div style="display: flex; justify-content: space-between; color: #4a7c59; font-size: 0.9rem;">
                    <span>PPN (${taxSettings.ppn.percentage}%):</span>
                    <span>Rp ${calculation.taxAmount.toLocaleString('id-ID')}</span>
                </div>
            `;
        }
        
        if (breakdownHTML) {
            taxServiceBreakdown.innerHTML = breakdownHTML;
            taxServiceBreakdown.style.display = 'block';
        } else {
            taxServiceBreakdown.style.display = 'none';
        }
    }
    
    // Apply rounding
    const roundedAmount = applyRounding(calculation.finalAmount);
    const roundingAmount = roundedAmount - calculation.finalAmount;
    
    // Show rounding if applied
    const roundingDisplay = document.getElementById('roundingDisplay');
    const roundingAmountEl = document.getElementById('roundingAmount');
    
    if (roundingDisplay && roundingAmountEl && roundingSettings.active && roundingAmount !== 0) {
        roundingAmountEl.textContent = `${roundingAmount >= 0 ? '+' : ''}Rp ${roundingAmount.toLocaleString('id-ID')}`;
        roundingDisplay.style.display = 'block';
    } else if (roundingDisplay) {
        roundingDisplay.style.display = 'none';
    }
    
    totalAmount.textContent = `Rp ${roundedAmount.toLocaleString('id-ID')}`;
    
    // Recalculate change if cash payment is selected
    if (selectedPaymentMethod === 'cash') {
        calculateChange();
    }
}

function calculateTaxAndService(subtotal) {
    let currentAmount = subtotal;
    
    // Apply discount first
    if (appliedDiscount) {
        currentAmount = subtotal - appliedDiscount.amount;
    }
    
    let serviceAmount = 0;
    let taxAmount = 0;
    
    // Calculate service charge first (applied before tax)
    if (taxSettings.service.active && taxSettings.service.percentage > 0) {
        serviceAmount = Math.round(currentAmount * (taxSettings.service.percentage / 100));
        currentAmount += serviceAmount;
    }
    
    // Calculate tax on subtotal + service
    if (taxSettings.ppn.active && taxSettings.ppn.percentage > 0) {
        taxAmount = Math.round(currentAmount * (taxSettings.ppn.percentage / 100));
        currentAmount += taxAmount;
    }
    
    return {
        subtotal: subtotal,
        serviceAmount: serviceAmount,
        taxAmount: taxAmount,
        finalAmount: currentAmount
    };
}

function applyRounding(amount) {
    if (!roundingSettings.active) {
        return amount;
    }
    
    const increment = roundingSettings.increment;
    
    switch (roundingSettings.method) {
        case 'up':
            return Math.ceil(amount / increment) * increment;
        case 'down':
            return Math.floor(amount / increment) * increment;
        case 'nearest':
        default:
            return Math.round(amount / increment) * increment;
    }
}

// Payment methods setup
function setupPaymentMethods() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Remove active class from all methods
            paymentMethods.forEach(m => m.classList.remove('active'));
            
            // Add active class to clicked method
            this.classList.add('active');
            
            // Update selected payment method
            selectedPaymentMethod = this.dataset.method;
            
            // Handle specific payment method logic
            if (selectedPaymentMethod === 'cash') {
                showCashPaymentSection();
            } else {
                hideCashPaymentSection();
            }
        });
    });
}

function showCashPaymentSection() {
    const cashSection = document.getElementById('cashPaymentSection');
    if (cashSection) {
        cashSection.style.display = 'block';
        calculateChange();
    }
}

function hideCashPaymentSection() {
    const cashSection = document.getElementById('cashPaymentSection');
    if (cashSection) {
        cashSection.style.display = 'none';
    }
}

function calculateChange() {
    const cashAmountInput = document.getElementById('cashAmount');
    const changeAmountEl = document.getElementById('changeAmount');
    
    if (!cashAmountInput || !changeAmountEl) return;
    
    const cashAmount = parseFloat(cashAmountInput.value) || 0;
    const totalAmountText = document.getElementById('totalAmount').textContent.replace(/[^\d]/g, '');
    const totalAmount = parseFloat(totalAmountText);
    
    const change = cashAmount - totalAmount;
    
    if (change >= 0) {
        changeAmountEl.textContent = `Rp ${change.toLocaleString('id-ID')}`;
        changeAmountEl.style.color = '#2d5016';
    } else {
        changeAmountEl.textContent = `Kurang: Rp ${Math.abs(change).toLocaleString('id-ID')}`;
        changeAmountEl.style.color = '#dc3545';
    }
}

// Process payment
function processPayment() {
    if (cart.length === 0) {
        showSuccess('Keranjang masih kosong!', 'error');
        return;
    }
    
    const totalAmountText = document.getElementById('totalAmount').textContent.replace(/[^\d]/g, '');
    const totalAmount = parseFloat(totalAmountText);
    
    // Validate cash payment
    if (selectedPaymentMethod === 'cash') {
        const cashAmountInput = document.getElementById('cashAmount');
        const cashAmount = parseFloat(cashAmountInput?.value) || 0;
        
        if (cashAmount < totalAmount) {
            showSuccess('Jumlah pembayaran kurang!', 'error');
            return;
        }
    }
    
    // Process the payment
    const transactionId = 'TXN' + Date.now();
    
    // Here you would normally send transaction to backend
    console.log('Processing payment:', {
        transactionId,
        items: cart,
        total: totalAmount,
        paymentMethod: selectedPaymentMethod,
        discount: appliedDiscount,
        customer: selectedCustomer
    });
    
    // Show success and reset
    showSuccess(`Payment processed successfully! Transaction ID: ${transactionId}`);
    
    // Print receipt (mock)
    setTimeout(() => {
        printReceipt(transactionId, totalAmount);
        clearCart();
    }, 1000);
}

// Mock receipt printing
function printReceipt(transactionId, total) {
    console.log(`Receipt printed for transaction ${transactionId} - Total: Rp ${total.toLocaleString('id-ID')}`);
    showSuccess('Receipt printed successfully!');
}

// Remove discount
function removeDiscount() {
    appliedDiscount = null;
    updateCartDisplay();
    showSuccess('Discount removed');
}

// Show success message
function showSuccess(message, type = 'success') {
    const existingAlert = document.querySelector('.pos-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `pos-alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#f8d7da' : '#d4edda'};
        color: ${type === 'error' ? '#721c24' : '#155724'};
        border: 1px solid ${type === 'error' ? '#f5c6cb' : '#c3e6cb'};
        padding: 1rem;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1002;
        animation: slideInAlert 0.3s ease;
        max-width: 300px;
    `;
    
    alert.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="hgi-stroke ${type === 'error' ? 'hgi-alert-circle' : 'hgi-check-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInAlert {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
        style.remove();
    }, 3000);
}

// Make functions available globally
if (typeof window !== 'undefined') {
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.clearCart = clearCart;
    window.updateCartDisplay = updateCartDisplay;
    window.processPayment = processPayment;
    window.calculateChange = calculateChange;
    window.removeDiscount = removeDiscount;
    window.showSuccess = showSuccess;
    window.initPOS = initPOS;
}

// Initialize POS when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPOS);
} else {
    initPOS();
}
