// Pancong Kece - Settings Module
// Handles user settings, role management, and system configuration

let selectedRole = null;

// Role management functions
function showRoleChangeModal() {
    const modal = document.getElementById('roleChangeModal');
    if (modal) {
        modal.classList.add('active');
        // Reset selection
        selectedRole = null;
        updateRoleSelection();
    }
}

function closeRoleChangeModal() {
    const modal = document.getElementById('roleChangeModal');
    if (modal) {
        modal.classList.remove('active');
        selectedRole = null;
        updateRoleSelection();
    }
}

function selectRole(role) {
    selectedRole = role;
    updateRoleSelection();
    
    // Enable confirm button
    const confirmBtn = document.getElementById('confirmRoleBtn');
    if (confirmBtn) {
        confirmBtn.disabled = false;
    }
}

function updateRoleSelection() {
    const roleOptions = document.querySelectorAll('.role-option');
    const confirmBtn = document.getElementById('confirmRoleBtn');
    
    roleOptions.forEach(option => {
        const roleDiv = option.querySelector('div');
        const role = option.getAttribute('data-role');
        
        if (role === selectedRole) {
            roleDiv.style.borderColor = '#2d5016';
            roleDiv.style.background = 'linear-gradient(135deg, #f0f8f5 0%, #e8f5e8 100%)';
            roleDiv.style.transform = 'scale(1.02)';
        } else {
            roleDiv.style.borderColor = '#e8f5e8';
            roleDiv.style.background = 'white';
            roleDiv.style.transform = 'scale(1)';
        }
    });
    
    if (confirmBtn) {
        confirmBtn.disabled = selectedRole === null;
    }
}

function confirmRoleChange() {
    if (!selectedRole) return;
    
    // Update current role elements
    const currentRoleElements = document.querySelectorAll('#currentRole, #currentRoleDisplay');
    const newRoleText = selectedRole === 'kasir' ? 'Kasir' : 'Manager';
    
    console.log('Changing role to:', newRoleText, 'Selected role:', selectedRole); // Debug log
    
    currentRoleElements.forEach(element => {
        if (element) {
            element.textContent = newRoleText;
        }
    });
    
    // Save role to localStorage for persistence
    localStorage.setItem('userRole', selectedRole);
    
    // Close modal first
    closeRoleChangeModal();
    
    // Show success message
    const message = `Role berhasil diubah ke ${newRoleText}! ${selectedRole === 'manager' ? 'Sekarang Anda dapat mengakses semua fitur manajemen.' : 'Anda sekarang dalam mode Kasir dengan akses terbatas.'}`;
    
    if (typeof showSuccess === 'function') {
        showSuccess(message);
    }
    
    // Update role-based access with delay to ensure DOM is updated
    setTimeout(() => {
        if (typeof updateRoleAccess === 'function') {
            updateRoleAccess();
        }
    }, 200);
    
    // Force a second update to be sure
    setTimeout(() => {
        if (typeof updateRoleAccess === 'function') {
            updateRoleAccess();
        }
    }, 500);
}

// Username update function
function updateUsername() {
    const usernameInput = document.getElementById('usernameInput');
    const currentUserElement = document.getElementById('currentUser');
    
    if (usernameInput && currentUserElement && usernameInput.value.trim()) {
        const newUsername = usernameInput.value.trim();
        currentUserElement.textContent = newUsername;
        
        if (typeof showSuccess === 'function') {
            showSuccess(`Username berhasil diubah ke "${newUsername}"`);
        }
    }
}

// Tax settings update
function updateTaxSettings() {
    const ppnActive = document.getElementById('ppnActive');
    const ppnPercentage = document.getElementById('ppnPercentage');
    const serviceActive = document.getElementById('serviceActive');
    const servicePercentage = document.getElementById('servicePercentage');
    
    if (ppnActive && ppnPercentage && serviceActive && servicePercentage) {
        // Update global tax settings
        if (typeof taxSettings !== 'undefined') {
            taxSettings.ppn.active = ppnActive.checked;
            taxSettings.ppn.percentage = parseFloat(ppnPercentage.value) || 0;
            taxSettings.service.active = serviceActive.checked;
            taxSettings.service.percentage = parseFloat(servicePercentage.value) || 0;
        }
        
        // Update cart display if POS is active
        if (typeof updateCartDisplay === 'function' && document.getElementById('pos') && document.getElementById('pos').classList.contains('active')) {
            updateCartDisplay();
        }
        
        if (typeof showSuccess === 'function') {
            showSuccess('Pengaturan pajak berhasil diperbarui');
        }
    }
}

// Rounding settings update
function updateRoundingSettings() {
    const roundingActive = document.getElementById('roundingActive');
    const roundingMethod = document.getElementById('roundingMethod');
    const roundingIncrement = document.getElementById('roundingIncrement');
    
    if (roundingActive && roundingMethod && roundingIncrement) {
        // Update global rounding settings
        if (typeof roundingSettings !== 'undefined') {
            roundingSettings.active = roundingActive.checked;
            roundingSettings.method = roundingMethod.value;
            roundingSettings.increment = parseInt(roundingIncrement.value) || 100;
        }
        
        // Update cart display if POS is active
        if (typeof updateCartDisplay === 'function' && document.getElementById('pos') && document.getElementById('pos').classList.contains('active')) {
            updateCartDisplay();
        }
        
        if (typeof showSuccess === 'function') {
            showSuccess('Pengaturan pembulatan berhasil diperbarui');
        }
    }
}

// Initialize settings when DOM is loaded
function initSettings() {
    // Update current role display
    const currentRoleElement = document.getElementById('currentRole');
    const currentRoleDisplayElement = document.getElementById('currentRoleDisplay');
    
    if (currentRoleElement && currentRoleDisplayElement) {
        currentRoleDisplayElement.textContent = currentRoleElement.textContent;
    }
    
    // Set initial tax settings values from global config
    if (typeof taxSettings !== 'undefined') {
        const ppnActive = document.getElementById('ppnActive');
        const ppnPercentage = document.getElementById('ppnPercentage');
        const serviceActive = document.getElementById('serviceActive');
        const servicePercentage = document.getElementById('servicePercentage');
        
        if (ppnActive) ppnActive.checked = taxSettings.ppn.active;
        if (ppnPercentage) ppnPercentage.value = taxSettings.ppn.percentage;
        if (serviceActive) serviceActive.checked = taxSettings.service.active;
        if (servicePercentage) servicePercentage.value = taxSettings.service.percentage;
    }
    
    // Set initial rounding settings values from global config
    if (typeof roundingSettings !== 'undefined') {
        const roundingActive = document.getElementById('roundingActive');
        const roundingMethod = document.getElementById('roundingMethod');
        const roundingIncrement = document.getElementById('roundingIncrement');
        
        if (roundingActive) roundingActive.checked = roundingSettings.active;
        if (roundingMethod) roundingMethod.value = roundingSettings.method;
        if (roundingIncrement) roundingIncrement.value = roundingSettings.increment.toString();
    }
    
    // Set initial username
    const currentUserElement = document.getElementById('currentUser');
    const usernameInput = document.getElementById('usernameInput');
    
    if (currentUserElement && usernameInput) {
        usernameInput.value = currentUserElement.textContent;
    }
}

// Modal click outside to close
document.addEventListener('click', function(e) {
    const modal = document.getElementById('roleChangeModal');
    if (modal && e.target === modal) {
        closeRoleChangeModal();
    }
});

// Escape key to close modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('roleChangeModal');
        if (modal && modal.classList.contains('active')) {
            closeRoleChangeModal();
        }
    }
});

// Make functions available globally
if (typeof window !== 'undefined') {
    window.showRoleChangeModal = showRoleChangeModal;
    window.closeRoleChangeModal = closeRoleChangeModal;
    window.selectRole = selectRole;
    window.confirmRoleChange = confirmRoleChange;
    window.updateUsername = updateUsername;
    window.updateTaxSettings = updateTaxSettings;
    window.updateRoundingSettings = updateRoundingSettings;
    window.initSettings = initSettings;
}

// Initialize settings when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Delay to ensure other modules are loaded first
        setTimeout(initSettings, 200);
    });
} else {
    setTimeout(initSettings, 200);
}
