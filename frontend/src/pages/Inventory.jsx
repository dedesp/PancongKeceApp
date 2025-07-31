import React, { useState, useEffect, useCallback } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus, Minus, Search, Filter } from 'lucide-react';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, low, out
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'add', // add, subtract, set
    quantity: '',
    reason: ''
  });

  // Removed mock inventory data - now using only database API calls

  // Load inventory on component mount
  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Load inventory
  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory');
      const result = await response.json();
      
      if (result.status === 'success') {
        // Transform data to match expected format
        const transformedData = result.data.map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.Product?.name || 'Unknown Product',
          category: 'General', // Default category since not in current model
          current_stock: item.quantity || 0,
          min_stock: item.min_stock || 10,
          max_stock: item.max_stock || 100,
          unit: 'pcs', // Default unit
          cost_per_unit: item.cost_per_unit || 0,
          last_updated: item.updated_at || new Date().toISOString(),
          status: item.quantity <= (item.min_stock || 10) ? 
                  (item.quantity === 0 ? 'out' : 'low') : 'normal'
        }));
        setInventory(transformedData);
       } else {
         console.error('Failed to fetch inventory:', result.message);
         setInventory([]);
       }
    } catch (error) {
      console.error('Error loading inventory:', error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter inventory based on search and status
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Handle stock adjustment
  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    try {
      const quantity = parseInt(adjustmentData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        alert('Jumlah harus berupa angka positif');
        return;
      }

      const updatedInventory = inventory.map(item => {
        if (item.id === selectedItem.id) {
          let newStock = item.current_stock;
          
          switch (adjustmentData.type) {
            case 'add':
              newStock += quantity;
              break;
            case 'subtract':
              newStock = Math.max(0, newStock - quantity);
              break;
            case 'set':
              newStock = quantity;
              break;
          }
          
          // Determine new status
          let status = 'normal';
          if (newStock === 0) status = 'out';
          else if (newStock <= item.min_stock) status = 'low';
          
          return {
            ...item,
            current_stock: newStock,
            status,
            last_updated: new Date().toISOString()
          };
        }
        return item;
      });
      
      setInventory(updatedInventory);
      setShowAdjustModal(false);
      setSelectedItem(null);
      setAdjustmentData({ type: 'add', quantity: '', reason: '' });
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('Gagal menyesuaikan stok. Silakan coba lagi.');
    }
  };

  // Open adjustment modal
  const openAdjustModal = (item) => {
    setSelectedItem(item);
    setShowAdjustModal(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    if (status === 'out') {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Habis</span>;
    } else if (status === 'low') {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Stok Rendah</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Normal</span>;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  // Calculate summary stats
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.status === 'low').length;
  const outOfStockItems = inventory.filter(item => item.status === 'out').length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.current_stock * item.cost_per_unit), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Inventaris</h1>
          <p className="text-gray-600">Kelola stok dan inventaris Sajati</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Item</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stok Rendah</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Habis</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nilai Total</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari produk atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">Semua Status</option>
              <option value="normal">Normal</option>
              <option value="low">Stok Rendah</option>
              <option value="out">Habis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Memuat data inventaris...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok Saat Ini
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min/Max
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nilai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Update Terakhir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.product_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className={`font-medium ${
                          item.status === 'out' ? 'text-red-600' :
                          item.status === 'low' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {item.current_stock}
                        </span>
                        <span className="text-gray-500 ml-1">{item.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.min_stock} / {item.max_stock} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.current_stock * item.cost_per_unit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.last_updated)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openAdjustModal(item)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Package className="w-4 h-4" />
                        Sesuaikan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredInventory.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Tidak ada item yang sesuai' : 'Belum ada inventaris'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' ? 'Coba ubah filter atau kata kunci pencarian' : 'Belum ada item inventaris yang terdaftar.'}
          </p>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Sesuaikan Stok</h2>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">{selectedItem.product_name}</h3>
              <p className="text-sm text-gray-600">Stok saat ini: {selectedItem.current_stock} {selectedItem.unit}</p>
            </div>
            
            <form onSubmit={handleStockAdjustment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Penyesuaian
                </label>
                <select
                  value={adjustmentData.type}
                  onChange={(e) => setAdjustmentData({...adjustmentData, type: e.target.value})}
                  className="input"
                >
                  <option value="add">Tambah Stok</option>
                  <option value="subtract">Kurangi Stok</option>
                  <option value="set">Set Stok</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustmentData.quantity}
                  onChange={(e) => setAdjustmentData({...adjustmentData, quantity: e.target.value})}
                  className="input"
                  placeholder="Masukkan jumlah"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan
                </label>
                <textarea
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                  className="input"
                  rows="3"
                  placeholder="Alasan penyesuaian stok"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Sesuaikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;