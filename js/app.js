// Pancong Kece - Main Application Entry Point
// Coordinates all modules and initializes the application

// Application initialization
function initializeApp() {
    console.log('🚀 Initializing Pancong Kece POS Application...');
    
    // Initialize all modules in sequence
    try {
        // 1. Setup navigation first
        if (typeof setupNavigation === 'function') {
            setupNavigation();
            console.log('✅ Navigation module loaded');
        }
        
        // 2. Update role-based access
        if (typeof updateRoleAccess === 'function') {
            updateRoleAccess();
            console.log('✅ Role-based access configured');
        }
        
        // 3. Initialize POS core functionality
        if (typeof initPOS === 'function') {
            initPOS();
            console.log('✅ POS core module loaded');
        }
        
        // 4. Initialize keyboard shortcuts
        if (typeof initKeyboardShortcuts === 'function') {
            initKeyboardShortcuts();
            console.log('✅ Keyboard shortcuts module loaded');
        }
        
        // 5. Setup additional event handlers
        setupAdditionalEventHandlers();
        
        console.log('🎉 Pancong Kece POS Application ready!');
        
        // Show welcome message
        setTimeout(() => {
            showWelcomeMessage();
        }, 500);
        
    } catch (error) {
        console.error('❌ Error initializing application:', error);
        showInitializationError(error);
    }
}

// Setup additional event handlers
function setupAdditionalEventHandlers() {
    // Handle cash amount input for change calculation
    const cashAmountInput = document.getElementById('cashAmount');
    if (cashAmountInput) {
        cashAmountInput.addEventListener('input', calculateChange);
        cashAmountInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && cart.length > 0) {
                processPayment();
            }
        });
    }
    
    // Handle window resize for responsive behavior
    window.addEventListener('resize', handleWindowResize);
    
    // Handle before unload to warn about unsaved transactions
    window.addEventListener('beforeunload', function(e) {
        if (cart.length > 0) {
            const message = 'Anda memiliki transaksi yang belum selesai. Yakin ingin meninggalkan halaman?';
            e.returnValue = message;
            return message;
        }
    });
    
    console.log('✅ Additional event handlers configured');
}

// Handle window resize
function handleWindowResize() {
    // Adjust layout for mobile devices
    if (window.innerWidth <= 768) {
        adjustMobileLayout();
    } else {
        adjustDesktopLayout();
    }
}

// Adjust layout for mobile
function adjustMobileLayout() {
    const sidebar = document.querySelector('.sidebar');
    const posContainer = document.querySelector('.pos-container');
    
    if (sidebar) {
        sidebar.style.width = '100%';
    }
    
    if (posContainer) {
        posContainer.style.gridTemplateColumns = '1fr';
        posContainer.style.height = 'auto';
    }
}

// Adjust layout for desktop
function adjustDesktopLayout() {
    const sidebar = document.querySelector('.sidebar');
    const posContainer = document.querySelector('.pos-container');
    
    if (sidebar) {
        sidebar.style.width = '280px';
    }
    
    if (posContainer) {
        posContainer.style.gridTemplateColumns = '1fr 400px';
        posContainer.style.height = 'calc(100vh - 200px)';
    }
}

// Show welcome message
function showWelcomeMessage() {
    const currentUser = document.getElementById('currentUser');
    const currentRole = document.getElementById('currentRole');
    
    const userName = currentUser ? currentUser.textContent : 'User';
    const userRole = currentRole ? currentRole.textContent : 'Kasir';
    
    const message = `Selamat datang, ${userName}! Anda masuk sebagai ${userRole}.`;
    
    if (typeof showSuccess === 'function') {
        showSuccess(message);
    }
}

// Show initialization error
function showInitializationError(error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        max-width: 400px;
        text-align: center;
    `;
    
    errorDiv.innerHTML = `
        <h3>⚠️ Application Error</h3>
        <p>Failed to initialize Pancong Kece POS:</p>
        <code style="background: rgba(0,0,0,0.1); padding: 0.5rem; border-radius: 4px; display: block; margin: 1rem 0;">
            ${error.message}
        </code>
        <button onclick="location.reload()" style="
            background: #dc3545; 
            color: white; 
            border: none; 
            padding: 0.5rem 1rem; 
            border-radius: 5px; 
            cursor: pointer;
        ">Reload Page</button>
    `;
    
    document.body.appendChild(errorDiv);
}

// Check if all required modules are loaded
function checkModuleAvailability() {
    const requiredFunctions = [
        'setupNavigation',
        'updateRoleAccess', 
        'initPOS',
        'initKeyboardShortcuts'
    ];
    
    const missingFunctions = requiredFunctions.filter(func => typeof window[func] !== 'function');
    
    if (missingFunctions.length > 0) {
        console.warn('⚠️ Some modules may not be loaded:', missingFunctions);
        return false;
    }
    
    return true;
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Small delay to ensure all script tags are processed
        setTimeout(initializeApp, 100);
    });
} else {
    // DOM already ready
    setTimeout(initializeApp, 100);
}

// Application state management
const AppState = {
    version: '1.0.0',
    initialized: false,
    modules: {
        navigation: false,
        pos: false,
        keyboard: false,
        config: true // config is always available as it's loaded first
    },
    
    setModuleLoaded(moduleName) {
        this.modules[moduleName] = true;
        console.log(`📦 Module "${moduleName}" loaded`);
    },
    
    isReady() {
        return Object.values(this.modules).every(loaded => loaded);
    }
};

// Export for debugging purposes
if (typeof window !== 'undefined') {
    window.PancongKeceApp = {
        state: AppState,
        initialize: initializeApp,
        checkModules: checkModuleAvailability
    };
}
