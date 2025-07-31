// Sajati Smart System - Navigation Module
// Handles section switching and navigation functionality

// Initialize navigation system
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items and sections
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked nav item
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Special handling for POS section
                if (sectionId === 'pos') {
                    // Reinitialize POS components when section becomes active
                    setTimeout(() => {
                        if (typeof initPOS === 'function') {
                            initPOS();
                        }
                        
                        // Show keyboard shortcuts notification for POS
                        if (typeof showKeyboardShortcutsNotification === 'function') {
                            showKeyboardShortcutsNotification();
                        }
                    }, 100);
                }
                
                // Special handling for Reports section
                if (sectionId === 'reports') {
                    // Initialize reports when section becomes active
                    setTimeout(() => {
                        if (typeof initReports === 'function') {
                            initReports();
                        }
                    }, 100);
                }
            }
        });
    });
}

// Update role-based access
function updateRoleAccess() {
    const currentRoleElement = document.getElementById('currentRole');
    const currentRole = currentRoleElement ? currentRoleElement.textContent.toLowerCase() : 'kasir';
    
    const managerOnlyItems = document.querySelectorAll('.manager-only');
    
    console.log('Current role:', currentRole); // Debug log
    
    if (currentRole === 'kasir') {
        // Hide manager-only navigation items for cashier role
        managerOnlyItems.forEach(item => {
            item.style.display = 'none';
        });
        console.log('Manager menus hidden for Kasir role');
    } else if (currentRole === 'manager') {
        // Show all items for manager role
        managerOnlyItems.forEach(item => {
            item.style.display = 'flex';
        });
        console.log('Manager menus shown for Manager role');
    } else {
        // Default case - check if role contains 'manager' (case-insensitive)
        const isManager = currentRole.includes('manager') || currentRole === 'admin';
        managerOnlyItems.forEach(item => {
            item.style.display = isManager ? 'flex' : 'none';
        });
        console.log('Role detection fallback:', currentRole, 'Is manager:', isManager);
    }
}

// Cafe operation controls
function toggleCafe(action) {
    const statusIcon = document.getElementById('cafeStatusIcon');
    const statusText = document.getElementById('cafeStatusText');
    const statusTime = document.getElementById('cafeStatusTime');
    const openBtn = document.getElementById('openCafeBtn');
    const closeBtn = document.getElementById('closeCafeBtn');
    
    if (!statusIcon || !statusText || !statusTime || !openBtn || !closeBtn) return;
    
    const currentTime = new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    if (action === 'open') {
        statusIcon.style.background = '#28a745';
        statusText.textContent = 'Cafe Buka';
        statusTime.textContent = `Dibuka pukul ${currentTime}`;
        openBtn.style.display = 'none';
        closeBtn.style.display = 'inline-flex';
        cafeStatus.isOpen = true;
        cafeStatus.openTime = currentTime;
        
        showSuccess('Cafe berhasil dibuka');
    } else if (action === 'close') {
        if (cart.length > 0) {
            if (!confirm('Masih ada transaksi aktif. Yakin ingin menutup cafe?')) {
                return;
            }
        }
        
        statusIcon.style.background = '#dc3545';
        statusText.textContent = 'Cafe Tutup';
        statusTime.textContent = `Ditutup pukul ${currentTime}`;
        openBtn.style.display = 'inline-flex';
        closeBtn.style.display = 'none';
        cafeStatus.isOpen = false;
        
        showSuccess('Cafe berhasil ditutup');
    }
}

// Make functions available globally
if (typeof window !== 'undefined') {
    window.setupNavigation = setupNavigation;
    window.updateRoleAccess = updateRoleAccess;
    window.toggleCafe = toggleCafe;
}

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupNavigation();
        updateRoleAccess();
    });
} else {
    setupNavigation();
    updateRoleAccess();
}
