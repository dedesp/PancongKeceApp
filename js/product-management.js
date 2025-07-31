// Sajati Smart System - Product Management Module
// Handles product CRUD operations and management interface

let filteredProducts = [];
let currentEditingProduct = null;

// Initialize Product Management
function initProductManagement() {
    loadProductsGrid();
    setupProductFilters();
}

// Load and display products in grid
function loadProductsGrid() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    filteredProducts = [...menuItems]; // Copy from global menuItems
    renderProductsGrid();
}

// Render products grid
function renderProductsGrid() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="hgi-stroke hgi-package"></i>
                <h3>Tidak ada produk ditemukan</h3>
                <p>Coba ubah filter atau tambah produk baru</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-card-header">
                <div class="product-status ${product.available !== false ? 'available' : 'unavailable'}">
                    ${product.available !== false ? 'Tersedia' : 'Habis'}
                </div>
                ${product.keyboardShortcut ? `<div class="product-shortcut">${product.keyboardShortcut}</div>` : ''}
            </div>
            <div class="product-card-content">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${getCategoryName(product.category)}</p>
                <div class="product-price">Rp ${product.price.toLocaleString('id-ID')}</div>
                ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
            </div>
            <div class="product-card-actions">
                <button class="btn-secondary btn-sm" onclick="editProduct(${product.id})">
                    <i class="hgi-stroke hgi-edit-01"></i>
                    Edit
                </button>
                <button class="btn-primary btn-sm" onclick="toggleProductStatus(${product.id})">
                    <i class="hgi-stroke hgi-refresh"></i>
                    ${product.available !== false ? 'Non-aktifkan' : 'Aktifkan'}
                </button>
            </div>
        </div>
    `).join('');
}

// Get category display name
function getCategoryName(category) {
    const categories = {
        'Coffee': 'kopi',
        'noncoffee': 'nonkopi'
        'food': 'makanan',
        'snacks': 'lightmeal',
        'others': 'lainnya'
    };
    return categories[category] || 'Tidak Diketahui';
}

// Filter products by category
function filterProducts(category) {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-category="${category}"]`).classList.add('active');

    if (category === 'all') {
        filteredProducts = [...menuItems];
    } else {
        filteredProducts = menuItems.filter(product => product.category === category);
    }

    renderProductsGrid();
}

// Search products
function searchProducts() {
    const searchInput = document.getElementById('productSearchInput');
    const query = searchInput.value.toLowerCase().trim();

    if (query === '') {
        const activeCategory = document.querySelector('.filter-tab.active').getAttribute('data-category');
        filterProducts(activeCategory);
        return;
    }

    filteredProducts = menuItems.filter(product =>
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        getCategoryName(product.category).toLowerCase().includes(query)
    );

    renderProductsGrid();
}

// Sort products
function sortProducts() {
    const sortSelect = document.getElementById('productSortSelect');
    const sortBy = sortSelect.value;

    switch (sortBy) {
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'category':
            filteredProducts.sort((a, b) => a.category.localeCompare(b.category));
            break;
        case 'popularity':
            // Sort by sales/popularity (mock data for now)
            filteredProducts.sort((a, b) => (b.sales || 0) - (a.sales || 0));
            break;
    }

    renderProductsGrid();
}

// Show add product modal
function showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    const form = document.getElementById('addProductForm');

    // Reset form
    form.reset();
    document.getElementById('productAvailable').checked = true;

    // Update available keyboard shortcuts
    updateAvailableShortcuts('productKeyboardShortcut');

    modal.classList.add('active');
}

// Close add product modal
function closeAddProductModal() {
    const modal = document.getElementById('addProductModal');
    modal.classList.remove('active');
}

// Save new product
function saveProduct() {
    const form = document.getElementById('addProductForm');
    const formData = new FormData(form);

    // Validate required fields
    if (!formData.get('name') || !formData.get('category') || !formData.get('price')) {
        if (typeof showError === 'function') {
            showError('Mohon lengkapi semua field yang wajib diisi');
        }
        return;
    }

    // Generate new ID
    const newId = Math.max(...menuItems.map(p => p.id), 0) + 1;

    // Create new product object
    const newProduct = {
        id: newId,
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseInt(formData.get('price')),
        description: formData.get('description') || '',
        keyboardShortcut: formData.get('keyboardShortcut') || null,
        available: formData.get('available') === 'on',
        sales: 0
    };

    // Add to menuItems array
    menuItems.push(newProduct);

    // Update keyboard shortcuts mapping if assigned
    if (newProduct.keyboardShortcut && typeof popularProducts !== 'undefined') {
        popularProducts[newProduct.keyboardShortcut] = {
            id: newProduct.id,
            name: newProduct.name
        };
    }

    // Reload products grid
    loadProductsGrid();

    // Close modal and show success
    closeAddProductModal();

    if (typeof showSuccess === 'function') {
        showSuccess(`Produk "${newProduct.name}" berhasil ditambahkan`);
    }

    // Refresh POS menu if active
    if (typeof loadMenu === 'function') {
        loadMenu();
    }
}

// Edit product
function editProduct(productId) {
    const product = menuItems.find(p => p.id === productId);
    if (!product) return;

    currentEditingProduct = product;

    // Fill form with product data
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductDescription').value = product.description || '';
    document.getElementById('editProductKeyboardShortcut').value = product.keyboardShortcut || '';
    document.getElementById('editProductAvailable').checked = product.available !== false;

    // Update available keyboard shortcuts
    updateAvailableShortcuts('editProductKeyboardShortcut', product.keyboardShortcut);

    // Show modal
    const modal = document.getElementById('editProductModal');
    modal.classList.add('active');
}

// Close edit product modal
function closeEditProductModal() {
    const modal = document.getElementById('editProductModal');
    modal.classList.remove('active');
    currentEditingProduct = null;
}

// Update product
function updateProduct() {
    if (!currentEditingProduct) return;

    const form = document.getElementById('editProductForm');
    const formData = new FormData(form);

    // Validate required fields
    if (!formData.get('name') || !formData.get('category') || !formData.get('price')) {
        if (typeof showError === 'function') {
            showError('Mohon lengkapi semua field yang wajib diisi');
        }
        return;
    }

    // Find product in array
    const productIndex = menuItems.findIndex(p => p.id === currentEditingProduct.id);
    if (productIndex === -1) return;

    // Remove old keyboard shortcut mapping
    if (currentEditingProduct.keyboardShortcut && typeof popularProducts !== 'undefined') {
        delete popularProducts[currentEditingProduct.keyboardShortcut];
    }

    // Update product data
    menuItems[productIndex] = {
        ...currentEditingProduct,
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseInt(formData.get('price')),
        description: formData.get('description') || '',
        keyboardShortcut: formData.get('keyboardShortcut') || null,
        available: formData.get('available') === 'on'
    };

    // Add new keyboard shortcut mapping
    const updatedProduct = menuItems[productIndex];
    if (updatedProduct.keyboardShortcut && typeof popularProducts !== 'undefined') {
        popularProducts[updatedProduct.keyboardShortcut] = {
            id: updatedProduct.id,
            name: updatedProduct.name
        };
    }

    // Reload products grid
    loadProductsGrid();

    // Close modal and show success
    closeEditProductModal();

    if (typeof showSuccess === 'function') {
        showSuccess(`Produk "${updatedProduct.name}" berhasil diperbarui`);
    }

    // Refresh POS menu if active
    if (typeof loadMenu === 'function') {
        loadMenu();
    }
}

// Delete product
function deleteProduct() {
    if (!currentEditingProduct) return;

    if (!confirm(`Yakin ingin menghapus produk "${currentEditingProduct.name}"? Aksi ini tidak dapat dibatalkan.`)) {
        return;
    }

    // Remove from menuItems array
    const productIndex = menuItems.findIndex(p => p.id === currentEditingProduct.id);
    if (productIndex !== -1) {
        // Remove keyboard shortcut mapping
        if (currentEditingProduct.keyboardShortcut && typeof popularProducts !== 'undefined') {
            delete popularProducts[currentEditingProduct.keyboardShortcut];
        }

        menuItems.splice(productIndex, 1);
    }

    // Reload products grid
    loadProductsGrid();

    // Close modal and show success
    closeEditProductModal();

    if (typeof showSuccess === 'function') {
        showSuccess(`Produk "${currentEditingProduct.name}" berhasil dihapus`);
    }

    // Refresh POS menu if active
    if (typeof loadMenu === 'function') {
        loadMenu();
    }
}

// Toggle product availability
function toggleProductStatus(productId) {
    const product = menuItems.find(p => p.id === productId);
    if (!product) return;

    product.available = !product.available;

    renderProductsGrid();

    if (typeof showSuccess === 'function') {
        const status = product.available ? 'diaktifkan' : 'dinonaktifkan';
        showSuccess(`Produk "${product.name}" berhasil ${status}`);
    }

    // Refresh POS menu if active
    if (typeof loadMenu === 'function') {
        loadMenu();
    }
}

// Update available keyboard shortcuts dropdown
function updateAvailableShortcuts(selectId, currentShortcut = null) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const usedShortcuts = menuItems
        .filter(p => p.keyboardShortcut && p.keyboardShortcut !== currentShortcut)
        .map(p => p.keyboardShortcut);

    const options = select.querySelectorAll('option');
    options.forEach(option => {
        const value = option.value;
        if (value && usedShortcuts.includes(value)) {
            option.disabled = true;
            option.textContent = `${value} (Sudah digunakan)`;
        } else if (value) {
            option.disabled = false;
            option.textContent = value;
        }
    });
}

// Setup product filters
function setupProductFilters() {
    // Initialize active filter
    filterProducts('all');
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
    window.initProductManagement = initProductManagement;
    window.loadProductsGrid = loadProductsGrid;
    window.filterProducts = filterProducts;
    window.searchProducts = searchProducts;
    window.sortProducts = sortProducts;
    window.showAddProductModal = showAddProductModal;
    window.closeAddProductModal = closeAddProductModal;
    window.saveProduct = saveProduct;
    window.editProduct = editProduct;
    window.closeEditProductModal = closeEditProductModal;
    window.updateProduct = updateProduct;
    window.deleteProduct = deleteProduct;
    window.toggleProductStatus = toggleProductStatus;
}

// Initialize when products section becomes active
document.addEventListener('DOMContentLoaded', function() {
    // Setup observer for when products section becomes active
    const productsSection = document.getElementById('products');
    if (productsSection) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (productsSection.classList.contains('active')) {
                        setTimeout(initProductManagement, 100);
                    }
                }
            });
        });

        observer.observe(productsSection, {
            attributes: true
        });
    }
});