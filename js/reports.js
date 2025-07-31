// Sajati Smart System - Reports Module
// Handles sales reports, analytics, and transaction history

let reportData = {
    transactions: [],
    period: 'month',
    startDate: null,
    endDate: null
};

// Sample transaction data (in real app, this would come from database)
let sampleTransactions = [
    // Juli 2025 - Week 4 (Recent data)
    { id: 'TXN001', date: new Date(2025, 6, 22, 9, 15), items: ['Kopi Americano', 'Sajati Original'], paymentMethod: 'cash', subtotal: 25000, tax: 2750, service: 1250, total: 29000, cashier: 'Andi Pratama' },
    { id: 'TXN002', date: new Date(2025, 6, 22, 10, 30), items: ['Latte', 'Croissant'], paymentMethod: 'card', subtotal: 35000, tax: 3850, service: 1750, total: 40600, cashier: 'Sari Dewi' },
    { id: 'TXN003', date: new Date(2025, 6, 22, 11, 45), items: ['Cappuccino', 'Sajati Cokelat'], paymentMethod: 'qris', subtotal: 30000, tax: 3300, service: 1500, total: 34800, cashier: 'Andi Pratama' },
    { id: 'TXN004', date: new Date(2025, 6, 22, 14, 20), items: ['Es Teh Manis'], paymentMethod: 'cash', subtotal: 8000, tax: 880, service: 400, total: 9280, cashier: 'Sari Dewi' },
    { id: 'TXN005', date: new Date(2025, 6, 22, 15, 35), items: ['Americano', 'Latte', 'Kue Brownies'], paymentMethod: 'card', subtotal: 45000, tax: 4950, service: 2250, total: 52200, cashier: 'Andi Pratama' },
    
    // Juli 2025 - Week 3
    { id: 'TXN006', date: new Date(2025, 6, 21, 16, 10), items: ['Sajati Original', 'Kopi Tubruk'], paymentMethod: 'qris', subtotal: 20000, tax: 2200, service: 1000, total: 23200, cashier: 'Sari Dewi' },
    { id: 'TXN007', date: new Date(2025, 6, 21, 12, 45), items: ['Cappuccino', 'Sandwich Club'], paymentMethod: 'cash', subtotal: 38000, tax: 4180, service: 1900, total: 44080, cashier: 'Andi Pratama' },
    { id: 'TXN008', date: new Date(2025, 6, 20, 13, 20), items: ['Latte', 'Sajati Keju'], paymentMethod: 'qris', subtotal: 28000, tax: 3080, service: 1400, total: 32480, cashier: 'Sari Dewi' },
    { id: 'TXN009', date: new Date(2025, 6, 20, 10, 15), items: ['Kopi Americano'], paymentMethod: 'card', subtotal: 15000, tax: 1650, service: 750, total: 17400, cashier: 'Andi Pratama' },
    { id: 'TXN010', date: new Date(2025, 6, 19, 14, 30), items: ['Es Teh Lemon', 'Sajati Original', 'Cookies'], paymentMethod: 'cash', subtotal: 32000, tax: 3520, service: 1600, total: 37120, cashier: 'Sari Dewi' },
    
    // Juli 2025 - Week 2
    { id: 'TXN011', date: new Date(2025, 6, 18, 11, 25), items: ['Cappuccino', 'Croissant'], paymentMethod: 'qris', subtotal: 33000, tax: 3630, service: 1650, total: 38280, cashier: 'Andi Pratama' },
    { id: 'TXN012', date: new Date(2025, 6, 17, 9, 40), items: ['Latte', 'Muffin Blueberry'], paymentMethod: 'card', subtotal: 31000, tax: 3410, service: 1550, total: 35960, cashier: 'Sari Dewi' },
    { id: 'TXN013', date: new Date(2025, 6, 16, 15, 15), items: ['Americano', 'Sajati Cokelat', 'Es Jeruk'], paymentMethod: 'cash', subtotal: 35000, tax: 3850, service: 1750, total: 40600, cashier: 'Andi Pratama' },
    { id: 'TXN014', date: new Date(2025, 6, 15, 13, 50), items: ['Cappuccino'], paymentMethod: 'qris', subtotal: 18000, tax: 1980, service: 900, total: 20880, cashier: 'Sari Dewi' },
    { id: 'TXN015', date: new Date(2025, 6, 14, 16, 35), items: ['Latte', 'Sandwich Tuna', 'Kopi Tubruk'], paymentMethod: 'card', subtotal: 42000, tax: 4620, service: 2100, total: 48720, cashier: 'Andi Pratama' },
    
    // Juli 2025 - Week 1
    { id: 'TXN016', date: new Date(2025, 6, 13, 10, 20), items: ['Es Teh Manis', 'Sajati Keju'], paymentMethod: 'cash', subtotal: 20000, tax: 2200, service: 1000, total: 23200, cashier: 'Sari Dewi' },
    { id: 'TXN017', date: new Date(2025, 6, 12, 12, 45), items: ['Americano', 'Cookies'], paymentMethod: 'qris', subtotal: 23000, tax: 2530, service: 1150, total: 26680, cashier: 'Andi Pratama' },
    { id: 'TXN018', date: new Date(2025, 6, 11, 14, 10), items: ['Cappuccino', 'Sajati Original', 'Kue Brownies'], paymentMethod: 'card', subtotal: 40000, tax: 4400, service: 2000, total: 46400, cashier: 'Sari Dewi' },
    { id: 'TXN019', date: new Date(2025, 6, 10, 11, 30), items: ['Latte'], paymentMethod: 'cash', subtotal: 20000, tax: 2200, service: 1000, total: 23200, cashier: 'Andi Pratama' },
    { id: 'TXN020', date: new Date(2025, 6, 9, 15, 55), items: ['Es Jeruk', 'Sajati Cokelat'], paymentMethod: 'qris', subtotal: 22000, tax: 2420, service: 1100, total: 25520, cashier: 'Sari Dewi' },
    
    // Juni 2025 - Sample data for comparison
    { id: 'TXN021', date: new Date(2025, 5, 30, 13, 45), items: ['Americano', 'Sandwich Club'], paymentMethod: 'card', subtotal: 33000, tax: 3630, service: 1650, total: 38280, cashier: 'Andi Pratama' },
    { id: 'TXN022', date: new Date(2025, 5, 29, 12, 20), items: ['Cappuccino', 'Muffin Cokelat'], paymentMethod: 'cash', subtotal: 29000, tax: 3190, service: 1450, total: 33640, cashier: 'Sari Dewi' },
    { id: 'TXN023', date: new Date(2025, 5, 28, 10, 15), items: ['Latte', 'Sajati Keju', 'Es Teh Lemon'], paymentMethod: 'qris', subtotal: 38000, tax: 4180, service: 1900, total: 44080, cashier: 'Andi Pratama' },
    { id: 'TXN024', date: new Date(2025, 5, 27, 14, 40), items: ['Kopi Tubruk'], paymentMethod: 'cash', subtotal: 12000, tax: 1320, service: 600, total: 13920, cashier: 'Sari Dewi' },
    { id: 'TXN025', date: new Date(2025, 5, 26, 16, 25), items: ['Americano', 'Cookies', 'Es Jeruk'], paymentMethod: 'card', subtotal: 31000, tax: 3410, service: 1550, total: 35960, cashier: 'Andi Pratama' },
    
    // Hari ini - data terbaru
    { id: 'TXN026', date: new Date(), items: ['Cappuccino', 'Sajati Original'], paymentMethod: 'qris', subtotal: 28000, tax: 3080, service: 1400, total: 32480, cashier: 'Andi Pratama' },
    { id: 'TXN027', date: new Date(Date.now() - 2*60*60*1000), items: ['Latte', 'Kue Brownies'], paymentMethod: 'cash', subtotal: 32000, tax: 3520, service: 1600, total: 37120, cashier: 'Sari Dewi' },
    { id: 'TXN028', date: new Date(Date.now() - 4*60*60*1000), items: ['Es Teh Manis'], paymentMethod: 'card', subtotal: 8000, tax: 880, service: 400, total: 9280, cashier: 'Andi Pratama' },
    { id: 'TXN029', date: new Date(Date.now() - 6*60*60*1000), items: ['Americano', 'Sandwich Tuna'], paymentMethod: 'qris', subtotal: 27000, tax: 2970, service: 1350, total: 31320, cashier: 'Sari Dewi' },
    { id: 'TXN030', date: new Date(Date.now() - 8*60*60*1000), items: ['Cappuccino', 'Sajati Keju', 'Es Jeruk'], paymentMethod: 'cash', subtotal: 38000, tax: 4180, service: 1900, total: 44080, cashier: 'Andi Pratama' }
];

// Initialize Reports
function initReports() {
    reportData.transactions = [...sampleTransactions];
    setDefaultDateRange();
    generateReport();
}

// Set default date range based on selected period
function setDefaultDateRange() {
    const today = new Date();
    const period = document.getElementById('reportPeriod').value;
    
    switch(period) {
        case 'today':
            reportData.startDate = new Date(today);
            reportData.endDate = new Date(today);
            break;
        case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            reportData.startDate = yesterday;
            reportData.endDate = yesterday;
            break;
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            reportData.startDate = weekStart;
            reportData.endDate = new Date(today);
            break;
        case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            reportData.startDate = monthStart;
            reportData.endDate = new Date(today);
            break;
    }
}

// Update report period
function updateReportPeriod() {
    const period = document.getElementById('reportPeriod').value;
    const customDateRange = document.getElementById('customDateRange');
    
    if (period === 'custom') {
        customDateRange.style.display = 'flex';
    } else {
        customDateRange.style.display = 'none';
        setDefaultDateRange();
        generateReport();
    }
}

// Apply custom date range
function applyCustomRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        if (typeof showError === 'function') {
            showError('Mohon pilih tanggal mulai dan akhir');
        }
        return;
    }
    
    reportData.startDate = new Date(startDate);
    reportData.endDate = new Date(endDate);
    generateReport();
}

// Generate complete report
function generateReport() {
    const filteredTransactions = filterTransactionsByDate();
    updateSummaryCards(filteredTransactions);
    updateSalesChart(filteredTransactions);
    updateTopProducts(filteredTransactions);
    updatePaymentMethodsChart(filteredTransactions);
    updateHourlyChart(filteredTransactions);
    updateTransactionsTable(filteredTransactions);
    
    if (typeof showSuccess === 'function') {
        showSuccess('Laporan berhasil diperbarui');
    }
}

// Filter transactions by selected date range
function filterTransactionsByDate() {
    if (!reportData.startDate || !reportData.endDate) {
        return reportData.transactions;
    }
    
    return reportData.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const startOfDay = new Date(reportData.startDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(reportData.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        return transactionDate >= startOfDay && transactionDate <= endOfDay;
    });
}

// Update summary cards
function updateSummaryCards(transactions) {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = transactions.length;
    const totalItems = transactions.reduce((sum, t) => sum + t.items.length, 0);
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    document.getElementById('totalRevenue').textContent = `Rp ${totalRevenue.toLocaleString('id-ID')}`;
    document.getElementById('totalTransactions').textContent = totalTransactions.toLocaleString('id-ID');
    document.getElementById('totalItems').textContent = totalItems.toLocaleString('id-ID');
    document.getElementById('averageTransaction').textContent = `Rp ${Math.round(averageTransaction).toLocaleString('id-ID')}`;
}

// Update sales chart (simplified version without chart library)
function updateSalesChart(transactions) {
    const canvas = document.getElementById('salesChart');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple bar chart representation
    const dailySales = {};
    transactions.forEach(transaction => {
        const dateKey = transaction.date.toDateString();
        if (!dailySales[dateKey]) {
            dailySales[dateKey] = 0;
        }
        dailySales[dateKey] += transaction.total;
    });
    
    const dates = Object.keys(dailySales).sort();
    const maxSales = Math.max(...Object.values(dailySales), 1);
    const barWidth = canvas.width / dates.length;
    
    ctx.fillStyle = '#2d5016';
    dates.forEach((date, index) => {
        const height = (dailySales[date] / maxSales) * (canvas.height - 40);
        const x = index * barWidth + 10;
        const y = canvas.height - height - 20;
        
        ctx.fillRect(x, y, barWidth - 20, height);
        
        // Add labels
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.fillText(new Date(date).getDate().toString(), x + 5, canvas.height - 5);
        ctx.fillStyle = '#2d5016';
    });
}

// Update top products list
function updateTopProducts(transactions) {
    const productCounts = {};
    
    transactions.forEach(transaction => {
        transaction.items.forEach(item => {
            if (!productCounts[item]) {
                productCounts[item] = 0;
            }
            productCounts[item]++;
        });
    });
    
    const sortedProducts = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const topProductsList = document.getElementById('topProductsList');
    topProductsList.innerHTML = sortedProducts.map((product, index) => `
        <div class="top-product-item">
            <div class="rank">${index + 1}</div>
            <div class="product-info">
                <div class="product-name">${product[0]}</div>
                <div class="product-count">${product[1]} terjual</div>
            </div>
        </div>
    `).join('');
}

// Update payment methods chart (simplified)
function updatePaymentMethodsChart(transactions) {
    const paymentCounts = {};
    
    transactions.forEach(transaction => {
        const method = transaction.paymentMethod;
        if (!paymentCounts[method]) {
            paymentCounts[method] = 0;
        }
        paymentCounts[method]++;
    });
    
    const canvas = document.getElementById('paymentChart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple pie chart representation
    const total = Object.values(paymentCounts).reduce((sum, count) => sum + count, 0);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    const colors = { 'cash': '#4CAF50', 'card': '#2196F3', 'qris': '#FF9800' };
    const labels = { 'cash': 'Tunai', 'card': 'Kartu', 'qris': 'QRIS' };
    
    let currentAngle = 0;
    Object.entries(paymentCounts).forEach(([method, count]) => {
        const sliceAngle = (count / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.fillStyle = colors[method] || '#ccc';
        ctx.fill();
        
        // Add label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius / 2);
        const labelY = centerY + Math.sin(labelAngle) * (radius / 2);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[method] || method, labelX, labelY);
        
        currentAngle += sliceAngle;
    });
}

// Update hourly sales chart
function updateHourlyChart(transactions) {
    const hourlySales = Array(24).fill(0);
    
    transactions.forEach(transaction => {
        const hour = transaction.date.getHours();
        hourlySales[hour] += transaction.total;
    });
    
    const canvas = document.getElementById('hourlyChart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const maxSales = Math.max(...hourlySales, 1);
    const barWidth = canvas.width / 24;
    
    ctx.fillStyle = '#4a7c59';
    hourlySales.forEach((sales, hour) => {
        if (sales > 0) {
            const height = (sales / maxSales) * (canvas.height - 40);
            const x = hour * barWidth + 5;
            const y = canvas.height - height - 20;
            
            ctx.fillRect(x, y, barWidth - 10, height);
            
            // Add hour labels for peak hours
            if (sales > maxSales * 0.3) {
                ctx.fillStyle = '#666';
                ctx.font = '10px sans-serif';
                ctx.fillText(`${hour}:00`, x, canvas.height - 5);
                ctx.fillStyle = '#4a7c59';
            }
        }
    });
}

// Update transactions table
function updateTransactionsTable(transactions) {
    const tableBody = document.getElementById('transactionsTableBody');
    
    tableBody.innerHTML = transactions.map(transaction => `
        <tr>
            <td>${transaction.id}</td>
            <td>${transaction.date.toLocaleString('id-ID')}</td>
            <td>${transaction.items.join(', ')}</td>
            <td>${getPaymentMethodName(transaction.paymentMethod)}</td>
            <td>Rp ${transaction.subtotal.toLocaleString('id-ID')}</td>
            <td>Rp ${(transaction.tax + transaction.service).toLocaleString('id-ID')}</td>
            <td><strong>Rp ${transaction.total.toLocaleString('id-ID')}</strong></td>
            <td>${transaction.cashier}</td>
        </tr>
    `).join('');
}

// Get payment method display name
function getPaymentMethodName(method) {
    const names = {
        'cash': 'Tunai',
        'card': 'Kartu Debit/Kredit',
        'qris': 'QRIS',
        'ewallet': 'E-Wallet'
    };
    return names[method] || method;
}

// Search transactions
function searchTransactions() {
    const searchInput = document.getElementById('transactionSearch');
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        const filteredTransactions = filterTransactionsByDate();
        updateTransactionsTable(filteredTransactions);
        return;
    }
    
    const filteredTransactions = filterTransactionsByDate();
    const searchResults = filteredTransactions.filter(transaction => 
        transaction.id.toLowerCase().includes(query) ||
        transaction.items.some(item => item.toLowerCase().includes(query)) ||
        transaction.cashier.toLowerCase().includes(query) ||
        getPaymentMethodName(transaction.paymentMethod).toLowerCase().includes(query)
    );
    
    updateTransactionsTable(searchResults);
}

// Export report to CSV
function exportReport() {
    const filteredTransactions = filterTransactionsByDate();
    
    let csv = 'No. Transaksi,Tanggal/Waktu,Items,Metode Bayar,Subtotal,Pajak/Service,Total,Kasir\n';
    
    filteredTransactions.forEach(transaction => {
        csv += `${transaction.id},${transaction.date.toLocaleString('id-ID')},"${transaction.items.join('; ')}",${getPaymentMethodName(transaction.paymentMethod)},${transaction.subtotal},${transaction.tax + transaction.service},${transaction.total},${transaction.cashier}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_penjualan_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    if (typeof showSuccess === 'function') {
        showSuccess('Laporan berhasil diexport ke CSV');
    }
}

// Error display function
function showError(message) {
    if (typeof showSuccess === 'function') {
        showSuccess(message, 'error');
    } else {
        alert(message);
    }
}

// Make functions available globally
if (typeof window !== 'undefined') {
    window.initReports = initReports;
    window.generateReport = generateReport;
    window.updateReportPeriod = updateReportPeriod;
    window.applyCustomRange = applyCustomRange;
    window.searchTransactions = searchTransactions;
    window.exportReport = exportReport;
}

// Initialize when reports section becomes active
document.addEventListener('DOMContentLoaded', function() {
    const reportsSection = document.getElementById('reports');
    if (reportsSection) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (reportsSection.classList.contains('active')) {
                        setTimeout(initReports, 100);
                    }
                }
            });
        });
        
        observer.observe(reportsSection, { attributes: true });
    }
});
