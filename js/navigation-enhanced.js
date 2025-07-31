/**
 * Enhanced Navigation System with Component Loading
 * Optimized navigation with lazy loading and component system
 */

class NavigationManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.loadedSections = new Set(['dashboard']); // Dashboard loaded by default
        this.sectionData = new Map();
        this.componentLoader = window.componentLoader;
        this.userRole = 'Kasir'; // Default role
        this.cafeStatus = {
            isOpen: true,
            openTime: '08:00',
            closeTime: null
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateRoleVisibility();
        this.showSection('dashboard');
    }

    setupEventListeners() {
        // Navigation item clicks
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                const sectionId = navItem.dataset.section;
                if (sectionId) {
                    this.navigateToSection(sectionId);
                }
            }
        });

        // Keyboard shortcuts for navigation
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.navigateToSection('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.navigateToSection('pos');
                        break;
                    case '3':
                        if (this.userRole === 'Manager') {
                            e.preventDefault();
                            this.navigateToSection('products');
                        }
                        break;
                }
            }
        });
    }

    /**
     * Navigate to specific section with lazy loading
     * @param {string} sectionId - Section ID to navigate to
     */
    async navigateToSection(sectionId) {
        // Check if user has permission
        if (!this.hasPermission(sectionId)) {
            commonUtils.showWarning('Anda tidak memiliki akses ke halaman ini');
            return;
        }

        // Show loading indicator
        this.showLoadingIndicator();

        try {
            // Load section component if not loaded
            if (!this.loadedSections.has(sectionId)) {
                await this.loadSectionComponent(sectionId);
                this.loadedSections.add(sectionId);
            }

            // Show section
            await this.showSection(sectionId);
            this.currentSection = sectionId;
            this.updateActiveNavigation();
            this.hideLoadingIndicator();

            // Track navigation for analytics
            this.trackNavigation(sectionId);

        } catch (error) {
            console.error(`Failed to navigate to ${sectionId}:`, error);
            commonUtils.showError(`Gagal memuat halaman ${sectionId}`);
            this.hideLoadingIndicator();
        }
    }

    /**
     * Load section component dynamically
     * @param {string} sectionId - Section ID to load
     */
    async loadSectionComponent(sectionId) {
        const componentPath = `components/pages/${sectionId}.html`;
        const sectionElement = document.getElementById(sectionId);
        
        if (!sectionElement) {
            throw new Error(`Section element #${sectionId} not found`);
        }

        // Load component data if needed
        const data = this.getSectionData(sectionId);
        
        // Render component
        await this.componentLoader.renderComponent(componentPath, sectionElement, data);

        // Initialize section-specific functionality
        await this.initializeSectionFeatures(sectionId);
    }

    /**
     * Get data for specific section
     * @param {string} sectionId - Section ID
     * @returns {Object} Section data
     */
    getSectionData(sectionId) {
        const baseData = {
            userRole: this.userRole,
            userName: 'Andi Pratama',
            currentDate: commonUtils.formatDate(new Date(), 'long')
        };

        switch(sectionId) {
            case 'dashboard':
                return {
                    ...baseData,
                    cafeStatus: this.cafeStatus.isOpen ? 'Buka' : 'Tutup',
                    cafeStatusTime: this.cafeStatus.isOpen ? 
                        `Dibuka pukul ${this.cafeStatus.openTime}` : 
                        `Ditutup pukul ${this.cafeStatus.closeTime}`,
                    todaySales: commonUtils.formatCurrency(2450000),
                    todayTransactions: '127',
                    activeEmployees: '8',
                    customerSatisfaction: '95%'
                };

            case 'pos':
                return {
                    ...baseData,
                    menuCategories: ['all', 'beverages', 'food', 'snacks']
                };

            default:
                return baseData;
        }
    }

    /**
     * Initialize section-specific features
     * @param {string} sectionId - Section ID
     */
    async initializeSectionFeatures(sectionId) {
        switch(sectionId) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'pos':
                this.initializePOS();
                break;
            case 'products':
                if (window.initProducts) window.initProducts();
                break;
            case 'inventory':
                if (window.initInventory) window.initInventory();
                break;
            case 'employees':
                if (window.initEmployees) window.initEmployees();
                break;
            case 'customers':
                if (window.initCustomers) window.initCustomers();
                break;
            case 'reports':
                if (window.initReports) window.initReports();
                break;
            case 'settings':
                if (window.initSettings) window.initSettings();
                break;
        }
    }

    /**
     * Initialize dashboard specific features
     */
    initializeDashboard() {
        // Load recent transactions
        this.loadRecentTransactions();
        
        // Setup real-time updates
        this.setupDashboardUpdates();
    }

    /**
     * Initialize POS specific features
     */
    initializePOS() {
        // Load menu items
        if (window.loadMenuItems) {
            window.loadMenuItems();
        }
        
        // Setup keyboard shortcuts
        if (window.initKeyboardShortcuts) {
            window.initKeyboardShortcuts();
        }
    }

    /**
     * Load recent transactions for dashboard
     */
    loadRecentTransactions() {
        const recentTransactions = [
            { time: '15:30', total: 'Rp 45.000', method: 'QRIS' },
            { time: '15:15', total: 'Rp 32.000', method: 'Cash' },
            { time: '14:50', total: 'Rp 28.000', method: 'Card' },
            { time: '14:35', total: 'Rp 15.000', method: 'Cash' },
            { time: '14:20', total: 'Rp 52.000', method: 'QRIS' }
        ];

        const tbody = document.getElementById('recentTransactions');
        if (tbody) {
            tbody.innerHTML = recentTransactions.map(transaction => `
                <tr>
                    <td>${transaction.time}</td>
                    <td>${transaction.total}</td>
                    <td>${transaction.method}</td>
                </tr>
            `).join('');
        }
    }

    /**
     * Setup dashboard real-time updates
     */
    setupDashboardUpdates() {
        // Simulate real-time updates every 30 seconds
        if (this.dashboardUpdateInterval) {
            clearInterval(this.dashboardUpdateInterval);
        }

        this.dashboardUpdateInterval = setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.updateDashboardStats();
            }
        }, 30000);
    }

    /**
     * Update dashboard statistics
     */
    updateDashboardStats() {
        // This would typically fetch real data from API
        console.log('Updating dashboard stats...');
    }

    /**
     * Show specific section
     * @param {string} sectionId - Section to show
     */
    async showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update document title
        document.title = `${this.getSectionTitle(sectionId)} - Sajati Smart System`;
    }

    /**
     * Get section title
     * @param {string} sectionId - Section ID
     * @returns {string} Section title
     */
    getSectionTitle(sectionId) {
        const titles = {
            dashboard: 'Dashboard',
            pos: 'Point of Sales',
            products: 'Manajemen Produk',
            inventory: 'Inventaris',
            employees: 'Karyawan',
            customers: 'Customer',
            crm: 'CRM',
            automation: 'AI & Automation',
            finance: 'Keuangan',
            reports: 'Laporan',
            settings: 'Pengaturan'
        };
        return titles[sectionId] || sectionId;
    }

    /**
     * Update active navigation item
     */
    updateActiveNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeItem = document.querySelector(`[data-section="${this.currentSection}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    /**
     * Check if user has permission for section
     * @param {string} sectionId - Section ID
     * @returns {boolean} Has permission
     */
    hasPermission(sectionId) {
        const managerOnlySections = ['products', 'inventory', 'employees', 'customers', 'crm', 'automation', 'finance', 'reports'];
        
        if (managerOnlySections.includes(sectionId)) {
            return this.userRole === 'Manager';
        }
        
        return true;
    }

    /**
     * Switch user role
     * @param {string} role - New role ('Kasir' or 'Manager')
     */
    switchRole(role) {
        this.userRole = role;
        this.updateRoleVisibility();
        
        // Update header
        const currentRoleElement = document.getElementById('currentRole');
        if (currentRoleElement) {
            currentRoleElement.textContent = role;
        }

        commonUtils.showSuccess(`Role berhasil diubah ke ${role}`);
    }

    /**
     * Update role-based visibility
     */
    updateRoleVisibility() {
        const managerOnlyItems = document.querySelectorAll('.manager-only');
        managerOnlyItems.forEach(item => {
            if (this.userRole === 'Manager') {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }

    /**
     * Show loading indicator
     */
    showLoadingIndicator() {
        const indicator = document.getElementById('globalLoadingIndicator');
        if (indicator) {
            indicator.style.display = 'flex';
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoadingIndicator() {
        const indicator = document.getElementById('globalLoadingIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    /**
     * Toggle cafe status
     * @param {string} action - 'open' or 'close'
     */
    toggleCafe(action) {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        if (action === 'open') {
            this.cafeStatus.isOpen = true;
            this.cafeStatus.openTime = currentTime;
            this.cafeStatus.closeTime = null;
            commonUtils.showSuccess('Cafe berhasil dibuka');
        } else {
            this.cafeStatus.isOpen = false;
            this.cafeStatus.closeTime = currentTime;
            commonUtils.showSuccess('Cafe berhasil ditutup');
        }

        this.updateCafeStatusUI();
    }

    /**
     * Update cafe status UI
     */
    updateCafeStatusUI() {
        const statusIcon = document.getElementById('cafeStatusIcon');
        const statusText = document.getElementById('cafeStatusText');
        const statusTime = document.getElementById('cafeStatusTime');
        const openBtn = document.getElementById('openCafeBtn');
        const closeBtn = document.getElementById('closeCafeBtn');

        if (this.cafeStatus.isOpen) {
            if (statusIcon) statusIcon.style.background = '#28a745';
            if (statusText) statusText.textContent = 'Cafe Buka';
            if (statusTime) statusTime.textContent = `Dibuka pukul ${this.cafeStatus.openTime}`;
            if (openBtn) openBtn.style.display = 'none';
            if (closeBtn) closeBtn.style.display = 'inline-flex';
        } else {
            if (statusIcon) statusIcon.style.background = '#dc3545';
            if (statusText) statusText.textContent = 'Cafe Tutup';
            if (statusTime) statusTime.textContent = `Ditutup pukul ${this.cafeStatus.closeTime}`;
            if (openBtn) openBtn.style.display = 'inline-flex';
            if (closeBtn) closeBtn.style.display = 'none';
        }
    }

    /**
     * Track navigation for analytics
     * @param {string} sectionId - Section ID
     */
    trackNavigation(sectionId) {
        // In a real app, this would send analytics data
        console.log(`Navigation: ${sectionId} at ${new Date().toISOString()}`);
    }

    /**
     * Get current navigation state
     * @returns {Object} Navigation state
     */
    getState() {
        return {
            currentSection: this.currentSection,
            userRole: this.userRole,
            loadedSections: Array.from(this.loadedSections),
            cafeStatus: this.cafeStatus
        };
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.dashboardUpdateInterval) {
            clearInterval(this.dashboardUpdateInterval);
        }
    }
}

// Initialize navigation manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
    
    // Make functions globally available for backward compatibility
    window.switchRole = (role) => window.navigationManager.switchRole(role);
    window.toggleCafe = (action) => window.navigationManager.toggleCafe(action);
    window.showSection = (sectionId) => window.navigationManager.navigateToSection(sectionId);
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}
