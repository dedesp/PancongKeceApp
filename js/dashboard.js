// Pancong Kece - Dashboard Module
// Handles dashboard real-time updates and statistics

let dashboardData = {
    todaySales: 0,
    todayTransactions: 0,
    activeEmployees: 8,
    customerSatisfaction: 95,
    recentTransactions: [],
    topProducts: []
};

// Ensure sample transactions are available (fallback if not loaded from reports.js)
if (typeof sampleTransactions === 'undefined') {
    window.sampleTransactions = [
        { id: 'TXN001', date: new Date(2024, 6, 22, 9, 15), items: ['Kopi Americano', 'Pancong Original'], paymentMethod: 'cash', subtotal: 25000, tax: 2750, service: 1250, total: 29000, cashier: 'Andi Pratama' },
        { id: 'TXN002', date: new Date(2024, 6, 22, 10, 30), items: ['Latte', 'Croissant'], paymentMethod: 'card', subtotal: 35000, tax: 3850, service: 1750, total: 40600, cashier: 'Sari Dewi' },
        { id: 'TXN003', date: new Date(2024, 6, 22, 11, 45), items: ['Cappuccino'], paymentMethod: 'qris', subtotal: 18000, tax: 1980, service: 900, total: 20880, cashier: 'Andi Pratama' },
        { id: 'TXN004', date: new Date(2024, 6, 21, 14, 20), items: ['Pancong Cokelat', 'Es Teh Manis'], paymentMethod: 'cash', subtotal: 22000, tax: 2420, service: 1100, total: 25520, cashier: 'Sari Dewi' },
        { id: 'TXN005', date: new Date(2024, 6, 21, 15, 35), items: ['Americano', 'Latte', 'Kue Brownies'], paymentMethod: 'card', subtotal: 45000, tax: 4950, service: 2250, total: 52200, cashier: 'Andi Pratama' }
    ];
}

// Initialize Dashboard
function initDashboard() {
    updateDashboardStats();
    loadRecentTransactions();
    loadTopProducts();
    
    // Auto refresh every 30 seconds
    setInterval(() => {
        updateDashboardStats();
        loadRecentTransactions();
    }, 30000);
}

// Update dashboard statistics
function updateDashboardStats() {
    // Get today's data from sample transactions (in real app, this would come from API)
    const today = new Date();
    const todayTransactions = sampleTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.toDateString() === today.toDateString();
    });
    
    // Calculate stats
    dashboardData.todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    dashboardData.todayTransactions = todayTransactions.length;
    
    // Update UI
    const statCards = document.querySelectorAll('.stat-card .stat-number');
    if (statCards.length >= 4) {
        statCards[0].textContent = `Rp ${dashboardData.todaySales.toLocaleString('id-ID')}`;
        statCards[1].textContent = dashboardData.todayTransactions.toString();
        statCards[2].textContent = dashboardData.activeEmployees.toString();
        statCards[3].textContent = `${dashboardData.customerSatisfaction}%`;
    }
}

// Load recent transactions
function loadRecentTransactions() {
    // Get 5 most recent transactions
    const recentTransactions = [...sampleTransactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    const tableBody = document.querySelector('#dashboard .table tbody');
    if (tableBody) {
        tableBody.innerHTML = recentTransactions.map(transaction => `
            <tr>
                <td>${transaction.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                <td>Rp ${transaction.total.toLocaleString('id-ID')}</td>
                <td>${getPaymentMethodName(transaction.paymentMethod)}</td>
            </tr>
        `).join('');
    }
}

// Load top products
function loadTopProducts() {
    // Calculate product popularity from transactions
    const productCounts = {};
    sampleTransactions.forEach(transaction => {
        transaction.items.forEach(item => {
            if (!productCounts[item]) {
                productCounts[item] = 0;
            }
            productCounts[item]++;
        });
    });
    
    const topProducts = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Update top products card
    const topProductsCard = document.querySelector('#dashboard .card:last-child');
    if (topProductsCard) {
        const loadingDiv = topProductsCard.querySelector('.loading');
        if (loadingDiv) {
            loadingDiv.innerHTML = `
                <div class="top-products-dashboard">
                    ${topProducts.map((product, index) => `
                        <div class="top-product-dashboard-item">
                            <div class="rank">${index + 1}</div>
                            <div class="product-info">
                                <div class="product-name">${product[0]}</div>
                                <div class="product-count">${product[1]} terjual</div>
                            </div>
                            <div class="product-percentage">${Math.round((product[1] / Math.max(...Object.values(productCounts))) * 100)}%</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
}

// Get payment method display name (reused from reports)
function getPaymentMethodName(method) {
    const names = {
        'cash': 'Tunai',
        'card': 'Kartu',
        'qris': 'QRIS',
        'ewallet': 'E-Wallet'
    };
    return names[method] || method;
}

// Add new transaction to dashboard (called from POS)
function addTransactionToDashboard(transaction) {
    sampleTransactions.unshift(transaction);
    updateDashboardStats();
    loadRecentTransactions();
    loadTopProducts();
}

// Update cafe status
function updateCafeStatus(isOpen, time, openBy = null) {
    const statusIcon = document.getElementById('cafeStatusIcon');
    const statusText = document.getElementById('cafeStatusText');
    const statusTime = document.getElementById('cafeStatusTime');
    
    if (statusIcon && statusText && statusTime) {
        if (isOpen) {
            statusIcon.style.background = '#28a745';
            statusText.textContent = 'Cafe Buka';
            statusTime.textContent = `Dibuka pukul ${time}${openBy ? ' oleh ' + openBy : ''}`;
        } else {
            statusIcon.style.background = '#dc3545';
            statusText.textContent = 'Cafe Tutup';
            statusTime.textContent = `Ditutup pukul ${time}`;
        }
    }
}

// Show dashboard alerts/notifications
function showDashboardAlert(type, message) {
    const alertsContainer = document.getElementById('dashboardAlerts');
    if (!alertsContainer) {
        // Create alerts container if it doesn't exist
        const container = document.createElement('div');
        container.id = 'dashboardAlerts';
        container.className = 'dashboard-alerts';
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboard.insertBefore(container, dashboard.firstChild.nextSibling);
        }
    }
    
    const alertElement = document.createElement('div');
    alertElement.className = `dashboard-alert alert-${type}`;
    alertElement.innerHTML = `
        <div class="alert-content">
            <i class="hgi-stroke ${type === 'success' ? 'hgi-check-circle' : type === 'warning' ? 'hgi-alert-triangle' : 'hgi-information-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.getElementById('dashboardAlerts').appendChild(alertElement);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertElement.parentNode) {
            alertElement.remove();
        }
    }, 5000);
}

// Quick actions for dashboard
function quickSaleEntry() {
    // Switch to POS section
    const posNavItem = document.querySelector('.nav-item[data-section="pos"]');
    if (posNavItem) {
        posNavItem.click();
    }
}

function viewDailyReport() {
    // Switch to reports section
    const reportsNavItem = document.querySelector('.nav-item[data-section="reports"]');
    if (reportsNavItem) {
        reportsNavItem.click();
        // Set to today's report
        setTimeout(() => {
            const reportPeriod = document.getElementById('reportPeriod');
            if (reportPeriod) {
                reportPeriod.value = 'today';
                if (typeof updateReportPeriod === 'function') {
                    updateReportPeriod();
                }
            }
        }, 200);
    }
}

function manageProducts() {
    // Switch to products section
    const productsNavItem = document.querySelector('.nav-item[data-section="products"]');
    if (productsNavItem) {
        productsNavItem.click();
    }
}

// Real-time clock update
function updateClock() {
    const clockElements = document.querySelectorAll('.dashboard-clock');
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    clockElements.forEach(element => {
        element.textContent = timeString;
    });
}

// Make functions available globally
if (typeof window !== 'undefined') {
    window.initDashboard = initDashboard;
    window.addTransactionToDashboard = addTransactionToDashboard;
    window.updateCafeStatus = updateCafeStatus;
    window.showDashboardAlert = showDashboardAlert;
    window.quickSaleEntry = quickSaleEntry;
    window.viewDailyReport = viewDailyReport;
    window.manageProducts = manageProducts;
}

// Initialize dashboard when section becomes active
document.addEventListener('DOMContentLoaded', function() {
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection && dashboardSection.classList.contains('active')) {
        setTimeout(initDashboard, 100);
    }
    
    // Setup observer for when dashboard section becomes active
    if (dashboardSection) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (dashboardSection.classList.contains('active')) {
                        setTimeout(initDashboard, 100);
                    }
                }
            });
        });
        
        observer.observe(dashboardSection, { attributes: true });
    }
    
    // Start real-time clock
    updateClock();
    setInterval(updateClock, 1000);
});
