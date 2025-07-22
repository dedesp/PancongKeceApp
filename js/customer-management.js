// Customer Management Module
class CustomerManagement {
    constructor() {
        this.customers = [
            {
                id: 'CUST001',
                name: 'Ahmad Wijaya',
                phone: '081234567890',
                email: 'ahmad.wijaya@email.com',
                address: 'Jl. Merdeka No. 123, Jakarta Pusat',
                birthdate: '1985-03-15',
                category: 'vip',
                points: 2500,
                totalSpent: 850000,
                visitCount: 45,
                lastVisit: '2025-01-20',
                joinDate: '2023-06-15',
                isActive: true
            },
            {
                id: 'CUST002', 
                name: 'Siti Nurhaliza',
                phone: '081987654321',
                email: 'siti.nurhaliza@email.com',
                address: 'Jl. Sudirman No. 456, Jakarta Selatan',
                birthdate: '1990-08-22',
                category: 'loyalty',
                points: 1800,
                totalSpent: 560000,
                visitCount: 28,
                lastVisit: '2025-01-19',
                joinDate: '2023-09-10',
                isActive: true
            },
            {
                id: 'CUST003',
                name: 'Budi Santoso',
                phone: '081555666777',
                email: 'budi.santoso@email.com',
                address: 'Jl. Thamrin No. 789, Jakarta Pusat',
                birthdate: '1988-12-05',
                category: 'regular',
                points: 450,
                totalSpent: 180000,
                visitCount: 12,
                lastVisit: '2025-01-15',
                joinDate: '2024-03-20',
                isActive: true
            },
            {
                id: 'CUST004',
                name: 'Maya Dewi',
                phone: '081444555666',
                email: 'maya.dewi@email.com',
                address: 'Jl. Gatot Subroto No. 321, Jakarta Selatan',
                birthdate: '1992-07-18',
                category: 'loyalty',
                points: 1200,
                totalSpent: 420000,
                visitCount: 22,
                lastVisit: '2025-01-18',
                joinDate: '2023-11-05',
                isActive: false
            },
            {
                id: 'CUST005',
                name: 'Rudi Hermawan',
                phone: '081777888999',
                email: 'rudi.hermawan@email.com',
                address: 'Jl. Kuningan No. 654, Jakarta Selatan',
                birthdate: '1987-04-10',
                category: 'vip',
                points: 3500,
                totalSpent: 1200000,
                visitCount: 68,
                lastVisit: '2025-01-21',
                joinDate: '2023-02-28',
                isActive: true
            }
        ];

        this.filteredCustomers = [...this.customers];
        this.init();
    }

    init() {
        this.updateSummary();
        this.renderCustomers();
        this.setupEventListeners();
    }

    updateSummary() {
        const totalCustomers = this.customers.length;
        const loyaltyMembers = this.customers.filter(c => c.category === 'loyalty' || c.category === 'vip').length;
        const totalPoints = this.customers.reduce((sum, c) => sum + c.points, 0);

        document.getElementById('totalCustomers').textContent = totalCustomers.toLocaleString('id-ID');
        document.getElementById('loyaltyMembers').textContent = loyaltyMembers.toLocaleString('id-ID');
        document.getElementById('totalLoyaltyPoints').textContent = totalPoints.toLocaleString('id-ID');
    }

    renderCustomers() {
        const container = document.getElementById('customerList');
        
        if (this.filteredCustomers.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="hgi-stroke hgi-search-01"></i>
                    <p>Tidak ada customer yang ditemukan</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredCustomers.map(customer => `
            <div class="customer-card ${!customer.isActive ? 'inactive' : ''}" data-customer-id="${customer.id}">
                <div class="customer-header">
                    <div class="customer-info">
                        <h3 class="customer-name">${customer.name}</h3>
                        <p class="customer-id">#${customer.id}</p>
                    </div>
                    <div class="customer-tier ${customer.category}">
                        ${this.getTierIcon(customer.category)}
                        <span>${this.getTierName(customer.category)}</span>
                    </div>
                </div>

                <div class="customer-details">
                    <div class="contact-info">
                        <div class="info-item">
                            <i class="hgi-stroke hgi-call"></i>
                            <span>${customer.phone}</span>
                        </div>
                        <div class="info-item">
                            <i class="hgi-stroke hgi-mail-01"></i>
                            <span>${customer.email}</span>
                        </div>
                    </div>

                    <div class="customer-stats">
                        <div class="stat-item">
                            <span class="stat-label">Total Belanja</span>
                            <span class="stat-value">Rp ${customer.totalSpent.toLocaleString('id-ID')}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Kunjungan</span>
                            <span class="stat-value">${customer.visitCount}x</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Poin</span>
                            <span class="stat-value points">${customer.points} pts</span>
                        </div>
                    </div>

                    <div class="customer-meta">
                        <span class="join-date">Bergabung: ${this.formatDate(customer.joinDate)}</span>
                        <span class="last-visit">Kunjungan terakhir: ${this.formatDate(customer.lastVisit)}</span>
                    </div>
                </div>

                <div class="customer-actions">
                    <button class="btn-icon" onclick="viewCustomerHistory('${customer.id}')" title="Lihat Riwayat">
                        <i class="hgi-stroke hgi-time-04"></i>
                    </button>
                    <button class="btn-icon" onclick="addLoyaltyPoints('${customer.id}')" title="Tambah Poin">
                        <i class="hgi-stroke hgi-star-01"></i>
                    </button>
                    <button class="btn-icon" onclick="editCustomer('${customer.id}')" title="Edit">
                        <i class="hgi-stroke hgi-pencil-edit-02"></i>
                    </button>
                    <button class="btn-icon ${customer.isActive ? 'deactivate' : 'activate'}" 
                            onclick="toggleCustomerStatus('${customer.id}')" 
                            title="${customer.isActive ? 'Nonaktifkan' : 'Aktifkan'}">
                        <i class="hgi-stroke ${customer.isActive ? 'hgi-user-minus-01' : 'hgi-user-check-01'}"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getTierIcon(category) {
        const icons = {
            regular: '<i class="hgi-stroke hgi-user-01"></i>',
            loyalty: '<i class="hgi-stroke hgi-star-01"></i>',
            vip: '<i class="hgi-stroke hgi-crown"></i>'
        };
        return icons[category] || icons.regular;
    }

    getTierName(category) {
        const names = {
            regular: 'Regular',
            loyalty: 'Loyalty',
            vip: 'VIP'
        };
        return names[category] || 'Regular';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('customerSearch').addEventListener('input', (e) => {
            this.searchCustomers(e.target.value);
        });
    }

    searchCustomers(query) {
        if (!query.trim()) {
            this.filteredCustomers = [...this.customers];
        } else {
            const searchLower = query.toLowerCase();
            this.filteredCustomers = this.customers.filter(customer => 
                customer.name.toLowerCase().includes(searchLower) ||
                customer.phone.includes(query) ||
                customer.email.toLowerCase().includes(searchLower) ||
                customer.id.toLowerCase().includes(searchLower)
            );
        }
        this.renderCustomers();
    }

    filterCustomers() {
        const typeFilter = document.getElementById('customerType').value;
        const statusFilter = document.getElementById('customerStatus').value;
        
        this.filteredCustomers = this.customers.filter(customer => {
            const typeMatch = typeFilter === 'all' || customer.category === typeFilter;
            const statusMatch = statusFilter === 'all' || 
                               (statusFilter === 'active' && customer.isActive) ||
                               (statusFilter === 'inactive' && !customer.isActive);
            
            return typeMatch && statusMatch;
        });
        
        this.renderCustomers();
    }

    addCustomer(customerData) {
        const newId = 'CUST' + String(this.customers.length + 1).padStart(3, '0');
        const newCustomer = {
            id: newId,
            ...customerData,
            points: parseInt(customerData.points) || 0,
            totalSpent: 0,
            visitCount: 0,
            lastVisit: null,
            joinDate: new Date().toISOString().split('T')[0],
            isActive: customerData.active !== false
        };

        this.customers.push(newCustomer);
        this.filteredCustomers = [...this.customers];
        this.updateSummary();
        this.renderCustomers();

        showNotification('Customer berhasil ditambahkan!', 'success');
        return newCustomer;
    }

    updateCustomer(customerId, customerData) {
        const index = this.customers.findIndex(c => c.id === customerId);
        if (index !== -1) {
            this.customers[index] = {
                ...this.customers[index],
                ...customerData,
                points: parseInt(customerData.points) || this.customers[index].points,
                isActive: customerData.active !== false
            };
            
            this.filteredCustomers = [...this.customers];
            this.updateSummary();
            this.renderCustomers();
            
            showNotification('Data customer berhasil diperbarui!', 'success');
            return this.customers[index];
        }
        return null;
    }

    toggleCustomerStatus(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            customer.isActive = !customer.isActive;
            this.renderCustomers();
            
            const status = customer.isActive ? 'diaktifkan' : 'dinonaktifkan';
            showNotification(`Customer ${customer.name} berhasil ${status}!`, 'success');
        }
    }

    addLoyaltyPoints(customerId, points) {
        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            customer.points += points;
            
            // Check for tier upgrade
            const newTier = this.calculateTier(customer.points);
            if (newTier !== customer.category && (newTier === 'loyalty' || newTier === 'vip')) {
                const oldTier = customer.category;
                customer.category = newTier;
                showNotification(`Selamat! ${customer.name} naik ke tier ${this.getTierName(newTier)}!`, 'success');
            }
            
            this.updateSummary();
            this.renderCustomers();
            return customer;
        }
        return null;
    }

    calculateTier(points) {
        if (points >= 3000) return 'vip';
        if (points >= 1000) return 'loyalty';
        return 'regular';
    }

    exportCustomers() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Data customer berhasil diekspor!', 'success');
    }

    generateCSV() {
        const headers = ['ID', 'Nama', 'Telepon', 'Email', 'Alamat', 'Kategori', 'Poin', 'Total Belanja', 'Kunjungan', 'Bergabung', 'Status'];
        const rows = this.customers.map(customer => [
            customer.id,
            customer.name,
            customer.phone,
            customer.email,
            customer.address,
            this.getTierName(customer.category),
            customer.points,
            customer.totalSpent,
            customer.visitCount,
            this.formatDate(customer.joinDate),
            customer.isActive ? 'Aktif' : 'Tidak Aktif'
        ]);

        return [headers, ...rows].map(row => 
            row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }
}

// Initialize customer management
let customerManager;

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('customerList')) {
        customerManager = new CustomerManagement();
    }
});

// Global functions for customer operations
function showAddCustomerModal() {
    document.getElementById('customerModalTitle').textContent = 'Tambah Customer Baru';
    document.getElementById('customerForm').reset();
    document.getElementById('customerId').value = '';
    document.getElementById('customerModal').style.display = 'block';
}

function editCustomer(customerId) {
    const customer = customerManager.customers.find(c => c.id === customerId);
    if (customer) {
        document.getElementById('customerModalTitle').textContent = 'Edit Customer';
        document.getElementById('customerId').value = customer.id;
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerPhone').value = customer.phone;
        document.getElementById('customerEmail').value = customer.email;
        document.getElementById('customerBirthdate').value = customer.birthdate;
        document.getElementById('customerAddress').value = customer.address;
        document.getElementById('customerCategory').value = customer.category;
        document.getElementById('initialPoints').value = customer.points;
        document.getElementById('customerActive').checked = customer.isActive;
        
        document.getElementById('customerModal').style.display = 'block';
    }
}

function closeCustomerModal() {
    document.getElementById('customerModal').style.display = 'none';
}

function saveCustomer() {
    const form = document.getElementById('customerForm');
    const formData = new FormData(form);
    
    const customerData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        birthdate: formData.get('birthdate'),
        address: formData.get('address'),
        category: formData.get('category'),
        points: formData.get('points'),
        active: formData.get('active') === 'on'
    };

    // Validation
    if (!customerData.name || !customerData.phone || !customerData.category) {
        showNotification('Mohon lengkapi field yang wajib diisi!', 'error');
        return;
    }

    const customerId = document.getElementById('customerId').value;
    
    if (customerId) {
        // Update existing customer
        customerManager.updateCustomer(customerId, customerData);
    } else {
        // Add new customer
        customerManager.addCustomer(customerData);
    }
    
    closeCustomerModal();
}

function filterCustomers() {
    if (customerManager) {
        customerManager.filterCustomers();
    }
}

function searchCustomers() {
    // Handled by event listener in CustomerManagement class
}

function toggleCustomerStatus(customerId) {
    if (customerManager) {
        customerManager.toggleCustomerStatus(customerId);
    }
}

function addLoyaltyPoints(customerId) {
    const points = prompt('Masukkan jumlah poin yang ingin ditambahkan:', '100');
    if (points && !isNaN(points)) {
        customerManager.addLoyaltyPoints(customerId, parseInt(points));
    }
}

function viewCustomerHistory(customerId) {
    const customer = customerManager.customers.find(c => c.id === customerId);
    if (customer) {
        alert(`Riwayat Customer: ${customer.name}\n\nTotal Kunjungan: ${customer.visitCount}x\nTotal Belanja: Rp ${customer.totalSpent.toLocaleString('id-ID')}\nPoin Loyalty: ${customer.points}\nKunjungan Terakhir: ${customerManager.formatDate(customer.lastVisit)}`);
    }
}

function exportCustomers() {
    if (customerManager) {
        customerManager.exportCustomers();
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('customerModal');
    if (event.target === modal) {
        closeCustomerModal();
    }
});
