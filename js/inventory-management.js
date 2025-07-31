// Sajati Smart System - Inventory Management Module
// Handles inventory CRUD operations and stock management

let inventoryItems = [
    { id: 1, name: 'Kopi Arabika', category: 'ingredients', currentStock: 25, minStock: 10, unit: 'kg', unitPrice: 120000, supplier: 'PT Kopi Nusantara', description: 'Biji kopi arabika premium' },
    { id: 2, name: 'Susu Segar', category: 'ingredients', currentStock: 15, minStock: 20, unit: 'liter', unitPrice: 12000, supplier: 'Dairy Farm', description: 'Susu segar untuk latte dan cappuccino' },
    { id: 3, name: 'Gula Pasir', category: 'ingredients', currentStock: 50, minStock: 25, unit: 'kg', unitPrice: 14000, supplier: 'Toko Sembako Jaya', description: 'Gula pasir untuk pemanis' },
    { id: 4, name: 'Cup Paper 12oz', category: 'packaging', currentStock: 500, minStock: 1000, unit: 'pcs', unitPrice: 650, supplier: 'Packaging Plus', description: 'Cup kertas untuk minuman panas' },
    { id: 5, name: 'Tutup Cup', category: 'packaging', currentStock: 400, minStock: 500, unit: 'pcs', unitPrice: 350, supplier: 'Packaging Plus', description: 'Tutup cup plastik' },
    { id: 6, name: 'Mesin Kopi', category: 'equipment', currentStock: 2, minStock: 1, unit: 'pcs', unitPrice: 15000000, supplier: 'Coffee Equipment Co', description: 'Mesin espresso commercial' },
    { id: 7, name: 'Tisu Meja', category: 'consumables', currentStock: 8, minStock: 15, unit: 'pack', unitPrice: 25000, supplier: 'Hygiene Supplies', description: 'Tisu untuk meja pelanggan' }
];

let filteredInventory = [];
let currentEditingItem = null;

// Initialize Inventory Management
function initInventory() {
    loadInventoryData();
    updateInventorySummary();
    filterInventory();
}

// Load inventory data
function loadInventoryData() {
    filteredInventory = [...inventoryItems];
    renderInventoryTable();
}

// Update inventory summary cards
function updateInventorySummary() {
    const totalItems = inventoryItems.length;
    const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.minStock).length;
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);

    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('lowStockItems').textContent = lowStockItems;
    document.getElementById('totalValue').textContent = `Rp ${totalValue.toLocaleString('id-ID')}`;
}

// Filter inventory by category and stock status
function filterInventory() {
    const categoryFilter = document.getElementById('inventoryCategory').value;
    const statusFilter = document.getElementById('stockStatus').value;
    
    filteredInventory = inventoryItems.filter(item => {
        let categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;
        let statusMatch = true;
        
        if (statusFilter !== 'all') {
            switch(statusFilter) {
                case 'adequate':
                    statusMatch = item.currentStock > item.minStock;
                    break;
                case 'low':
                    statusMatch = item.currentStock <= item.minStock && item.currentStock > 0;
                    break;
                case 'out':
                    statusMatch = item.currentStock === 0;
                    break;
            }
        }
        
        return categoryMatch && statusMatch;
    });
    
    renderInventoryTable();
}

// Search inventory items
function searchInventory() {
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    
    if (searchTerm === '') {
        filterInventory();
        return;
    }
    
    filteredInventory = inventoryItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.supplier.toLowerCase().includes(searchTerm)
    );
    
    renderInventoryTable();
}

// Render inventory table
function renderInventoryTable() {
    const tableBody = document.getElementById('inventoryTableBody');
    
    if (filteredInventory.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="hgi-stroke hgi-package"></i>
                    <p>Tidak ada item inventaris ditemukan</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filteredInventory.map(item => `
        <tr>
            <td>
                <div class="item-info">
                    <strong>${item.name}</strong>
                    ${item.description ? `<br><small class="text-muted">${item.description}</small>` : ''}
                </div>
            </td>
            <td>${getCategoryName(item.category)}</td>
            <td>
                <span class="stock-quantity ${getStockStatusClass(item)}">${item.currentStock}</span>
            </td>
            <td>${item.minStock}</td>
            <td>${item.unit}</td>
            <td>Rp ${item.unitPrice.toLocaleString('id-ID')}</td>
            <td><strong>Rp ${(item.currentStock * item.unitPrice).toLocaleString('id-ID')}</strong></td>
            <td>
                <span class="status-badge ${getStockStatusClass(item)}">
                    ${getStockStatusText(item)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-sm btn-primary" onclick="showStockAdjustment(${item.id})" title="Sesuaikan Stok">
                        <i class="hgi-stroke hgi-refresh"></i>
                    </button>
                    <button class="btn-sm btn-secondary" onclick="editInventoryItem(${item.id})" title="Edit Item">
                        <i class="hgi-stroke hgi-edit-01"></i>
                    </button>
                    <button class="btn-sm btn-danger" onclick="deleteInventoryItem(${item.id})" title="Hapus Item">
                        <i class="hgi-stroke hgi-delete-01"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get category display name
function getCategoryName(category) {
    const categories = {
        'ingredients': 'Bahan Baku',
        'packaging': 'Kemasan',
        'equipment': 'Peralatan',
        'consumables': 'Habis Pakai'
    };
    return categories[category] || category;
}

// Get stock status class for styling
function getStockStatusClass(item) {
    if (item.currentStock === 0) return 'out-of-stock';
    if (item.currentStock <= item.minStock) return 'low-stock';
    return 'adequate-stock';
}

// Get stock status text
function getStockStatusText(item) {
    if (item.currentStock === 0) return 'Habis';
    if (item.currentStock <= item.minStock) return 'Stok Menipis';
    return 'Stok Cukup';
}

// Show add inventory modal
function showAddInventoryModal() {
    document.getElementById('inventoryModalTitle').textContent = 'Tambah Item Inventaris';
    document.getElementById('inventoryForm').reset();
    document.getElementById('inventoryId').value = '';
    currentEditingItem = null;
    document.getElementById('inventoryModal').classList.add('active');
}

// Close inventory modal
function closeInventoryModal() {
    document.getElementById('inventoryModal').classList.remove('active');
    currentEditingItem = null;
}

// Save inventory item
function saveInventoryItem() {
    const form = document.getElementById('inventoryForm');
    const formData = new FormData(form);
    
    // Validate required fields
    const requiredFields = ['name', 'category', 'unit', 'currentStock', 'minStock', 'unitPrice'];
    for (let field of requiredFields) {
        if (!formData.get(field)) {
            showError(`Field ${field} harus diisi`);
            return;
        }
    }
    
    const itemData = {
        name: formData.get('name'),
        category: formData.get('category'),
        unit: formData.get('unit'),
        currentStock: parseFloat(formData.get('currentStock')),
        minStock: parseFloat(formData.get('minStock')),
        unitPrice: parseInt(formData.get('unitPrice')),
        supplier: formData.get('supplier') || '',
        description: formData.get('description') || ''
    };
    
    const itemId = document.getElementById('inventoryId').value;
    
    if (itemId) {
        // Update existing item
        const index = inventoryItems.findIndex(item => item.id === parseInt(itemId));
        if (index !== -1) {
            inventoryItems[index] = { ...inventoryItems[index], ...itemData };
            showSuccess('Item inventaris berhasil diperbarui');
        }
    } else {
        // Add new item
        const newId = Math.max(...inventoryItems.map(item => item.id), 0) + 1;
        inventoryItems.push({ id: newId, ...itemData });
        showSuccess('Item inventaris berhasil ditambahkan');
    }
    
    updateInventorySummary();
    filterInventory();
    closeInventoryModal();
}

// Edit inventory item
function editInventoryItem(itemId) {
    const item = inventoryItems.find(item => item.id === itemId);
    if (!item) return;
    
    currentEditingItem = item;
    
    document.getElementById('inventoryModalTitle').textContent = 'Edit Item Inventaris';
    document.getElementById('inventoryId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemUnit').value = item.unit;
    document.getElementById('currentStock').value = item.currentStock;
    document.getElementById('minStock').value = item.minStock;
    document.getElementById('unitPrice').value = item.unitPrice;
    document.getElementById('supplier').value = item.supplier;
    document.getElementById('itemDescription').value = item.description;
    
    document.getElementById('inventoryModal').classList.add('active');
}

// Delete inventory item
function deleteInventoryItem(itemId) {
    const item = inventoryItems.find(item => item.id === itemId);
    if (!item) return;
    
    if (confirm(`Yakin ingin menghapus item "${item.name}"? Aksi ini tidak dapat dibatalkan.`)) {
        inventoryItems = inventoryItems.filter(item => item.id !== itemId);
        updateInventorySummary();
        filterInventory();
        showSuccess(`Item "${item.name}" berhasil dihapus`);
    }
}

// Show stock adjustment modal
function showStockAdjustment(itemId) {
    const item = inventoryItems.find(item => item.id === itemId);
    if (!item) return;
    
    document.getElementById('adjustmentItemId').value = item.id;
    document.getElementById('adjustmentItemName').textContent = item.name;
    document.getElementById('currentStockDisplay').querySelector('span').textContent = `${item.currentStock} ${item.unit}`;
    
    // Reset form
    document.getElementById('stockAdjustmentForm').reset();
    document.getElementById('adjustmentPreview').style.display = 'none';
    
    document.getElementById('stockAdjustmentModal').classList.add('active');
}

// Close stock adjustment modal
function closeStockAdjustmentModal() {
    document.getElementById('stockAdjustmentModal').classList.remove('active');
}

// Update adjustment UI when type changes
function updateAdjustmentUI() {
    const adjustmentType = document.getElementById('adjustmentType').value;
    const quantityLabel = document.getElementById('adjustmentQuantityLabel');
    const quantityInput = document.getElementById('adjustmentQuantity');
    
    switch(adjustmentType) {
        case 'in':
            quantityLabel.textContent = 'Jumlah Masuk *';
            quantityInput.placeholder = 'Jumlah yang akan ditambahkan';
            break;
        case 'out':
            quantityLabel.textContent = 'Jumlah Keluar *';
            quantityInput.placeholder = 'Jumlah yang akan dikurangi';
            break;
        case 'set':
            quantityLabel.textContent = 'Stok Baru *';
            quantityInput.placeholder = 'Jumlah stok yang baru';
            break;
        default:
            quantityLabel.textContent = 'Jumlah *';
            quantityInput.placeholder = '';
    }
    
    updateAdjustmentPreview();
}

// Update adjustment preview
function updateAdjustmentPreview() {
    const itemId = parseInt(document.getElementById('adjustmentItemId').value);
    const item = inventoryItems.find(item => item.id === itemId);
    const adjustmentType = document.getElementById('adjustmentType').value;
    const quantity = parseFloat(document.getElementById('adjustmentQuantity').value);
    
    if (!item || !adjustmentType || isNaN(quantity)) {
        document.getElementById('adjustmentPreview').style.display = 'none';
        return;
    }
    
    let newStock;
    switch(adjustmentType) {
        case 'in':
            newStock = item.currentStock + quantity;
            break;
        case 'out':
            newStock = Math.max(0, item.currentStock - quantity);
            break;
        case 'set':
            newStock = quantity;
            break;
    }
    
    document.getElementById('previewOldStock').textContent = `${item.currentStock} ${item.unit}`;
    document.getElementById('previewNewStock').textContent = `${newStock} ${item.unit}`;
    document.getElementById('adjustmentPreview').style.display = 'block';
}

// Save stock adjustment
function saveStockAdjustment() {
    const itemId = parseInt(document.getElementById('adjustmentItemId').value);
    const adjustmentType = document.getElementById('adjustmentType').value;
    const quantity = parseFloat(document.getElementById('adjustmentQuantity').value);
    const reason = document.getElementById('adjustmentReason').value;
    
    if (!adjustmentType || isNaN(quantity)) {
        showError('Mohon lengkapi jenis penyesuaian dan jumlah');
        return;
    }
    
    const item = inventoryItems.find(item => item.id === itemId);
    if (!item) return;
    
    const oldStock = item.currentStock;
    let newStock;
    
    switch(adjustmentType) {
        case 'in':
            newStock = oldStock + quantity;
            break;
        case 'out':
            newStock = Math.max(0, oldStock - quantity);
            break;
        case 'set':
            newStock = quantity;
            break;
    }
    
    item.currentStock = newStock;
    
    // Log the adjustment (in real app, this would be saved to database)
    console.log(`Stock adjustment for ${item.name}: ${oldStock} → ${newStock} (${adjustmentType}: ${quantity}) - Reason: ${reason}`);
    
    updateInventorySummary();
    filterInventory();
    closeStockAdjustmentModal();
    
    showSuccess(`Stok ${item.name} berhasil disesuaikan dari ${oldStock} menjadi ${newStock} ${item.unit}`);
}

// Export inventory to CSV
function exportInventory() {
    let csv = 'Nama Item,Kategori,Stok Saat Ini,Min Stok,Unit,Harga per Unit,Total Nilai,Status,Supplier,Deskripsi\n';
    
    inventoryItems.forEach(item => {
        const totalValue = item.currentStock * item.unitPrice;
        const status = getStockStatusText(item);
        csv += `"${item.name}","${getCategoryName(item.category)}",${item.currentStock},${item.minStock},"${item.unit}",${item.unitPrice},${totalValue},"${status}","${item.supplier}","${item.description}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventaris_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showSuccess('Data inventaris berhasil diexport ke CSV');
}

// Utility functions
function showError(message) {
    if (typeof showSuccess === 'function') {
        showSuccess(message, 'error');
    } else {
        alert(message);
    }
}

// Make functions available globally
if (typeof window !== 'undefined') {
    window.initInventory = initInventory;
    window.filterInventory = filterInventory;
    window.searchInventory = searchInventory;
    window.showAddInventoryModal = showAddInventoryModal;
    window.closeInventoryModal = closeInventoryModal;
    window.saveInventoryItem = saveInventoryItem;
    window.editInventoryItem = editInventoryItem;
    window.deleteInventoryItem = deleteInventoryItem;
    window.showStockAdjustment = showStockAdjustment;
    window.closeStockAdjustmentModal = closeStockAdjustmentModal;
    window.updateAdjustmentUI = updateAdjustmentUI;
    window.saveStockAdjustment = saveStockAdjustment;
    window.exportInventory = exportInventory;
}

// Add event listeners for real-time preview
document.addEventListener('DOMContentLoaded', function() {
    // Setup observer for when inventory section becomes active
    const inventorySection = document.getElementById('inventory');
    if (inventorySection) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (inventorySection.classList.contains('active')) {
                        setTimeout(initInventory, 100);
                    }
                }
            });
        });
        
        observer.observe(inventorySection, { attributes: true });
    }
    
    // Add event listener for adjustment preview
    setTimeout(() => {
        const adjustmentQuantity = document.getElementById('adjustmentQuantity');
        if (adjustmentQuantity) {
            adjustmentQuantity.addEventListener('input', updateAdjustmentPreview);
        }
    }, 1000);
});
