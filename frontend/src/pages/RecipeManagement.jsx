import React, { useState, useEffect } from 'react';
import { ChefHat, Package, Calculator, TrendingUp, AlertTriangle, Plus, Search, Filter } from 'lucide-react';
import { clsx } from 'clsx';

const RecipeManagement = () => {
  const [activeTab, setActiveTab] = useState('recipes');
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recipesRes, productsRes, inventoryRes, alertsRes] = await Promise.all([
        fetch('/api/recipe-management/recipes'),
        fetch('/api/recipe-management/products'),
        fetch('/api/recipe-management/inventory/stock'),
        fetch('/api/recipe-management/inventory/alerts')
      ]);

      const [recipesData, productsData, inventoryData, alertsData] = await Promise.all([
        recipesRes.json(),
        productsRes.json(),
        inventoryRes.json(),
        alertsRes.json()
      ]);

      setRecipes(recipesData.data || []);
      setProducts(productsData.data || []);
      setInventory(inventoryData.data || []);
      setStockAlerts(alertsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'recipes', label: 'Resep & BOM', icon: ChefHat },
    { id: 'products', label: 'Produk', icon: Package },
    { id: 'inventory', label: 'Stok Bahan', icon: Calculator },
    { id: 'alerts', label: 'Peringatan Stok', icon: AlertTriangle }
  ];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCategory = selectedCategory === 'all' || recipe.product?.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(recipes.map(recipe => recipe.product?.category?.name).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recipe Management</h1>
            <p className="text-gray-600 mt-1">Kelola resep, BOM, dan stok bahan baku</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Tambah Resep</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChefHat className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Resep</p>
              <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Produk</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calculator className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Item Stok</p>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Peringatan Stok</p>
              <p className="text-2xl font-bold text-gray-900">{stockAlerts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm',
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Search and Filter */}
          {activeTab === 'recipes' && (
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari resep..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'recipes' && (
            <RecipesTab recipes={filteredRecipes} />
          )}
          {activeTab === 'products' && (
            <ProductsTab products={products} />
          )}
          {activeTab === 'inventory' && (
            <InventoryTab inventory={inventory} />
          )}
          {activeTab === 'alerts' && (
            <AlertsTab alerts={stockAlerts} />
          )}
        </div>
      </div>
    </div>
  );
};

// Recipes Tab Component
const RecipesTab = ({ recipes }) => {
  return (
    <div className="space-y-4">
      {recipes.length === 0 ? (
        <div className="text-center py-8">
          <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada resep yang tersedia</p>
        </div>
      ) : (
        recipes.map((recipe, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{recipe.product?.name || 'Unknown Product'}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{recipe.product?.category?.name || 'Unknown Category'}</span>
                  <span>Kode: {recipe.product?.sku || 'N/A'}</span>
                  <span>Yield: {recipe.yieldQuantity || 'N/A'}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">Rp {recipe.totalCost?.toLocaleString('id-ID') || '0'}</p>
                <p className="text-sm text-gray-600">Total Cost</p>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <h4 className="font-medium text-gray-900 mb-2">Bahan-bahan:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recipe.ingredients?.map((ingredient, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                    <span className="font-medium">{ingredient.material?.name || ingredient.subRecipe?.product?.name || 'Unknown Ingredient'}</span>
                    <div className="text-right">
                      <span className="text-gray-600">{ingredient.quantity} {ingredient.unit}</span>
                      <span className="ml-2 text-green-600 font-medium">Rp {ingredient.totalCost?.toLocaleString('id-ID') || '0'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Products Tab Component
const ProductsTab = ({ products }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HPP</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Jual</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{product.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.sku}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{product.category}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {product.hpp?.toLocaleString('id-ID')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {product.sellingPrice?.toLocaleString('id-ID')}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={clsx(
                  'px-2 py-1 rounded text-xs font-medium',
                  product.marginPercent >= 30 ? 'bg-green-100 text-green-800' :
                  product.marginPercent >= 20 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                )}>
                  {product.marginPercent?.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Inventory Tab Component
const InventoryTab = ({ inventory }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bahan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Saat Ini</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Satuan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Nilai</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {inventory.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{item.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.code}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={clsx(
                  'font-medium',
                  item.currentStock <= item.minStock ? 'text-red-600' :
                  item.currentStock <= item.minStock * 1.5 ? 'text-yellow-600' :
                  'text-green-600'
                )}>
                  {item.currentStock}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.unit}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {item.unitCost?.toLocaleString('id-ID')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Rp {(item.currentStock * item.unitCost)?.toLocaleString('id-ID')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Alerts Tab Component
const AlertsTab = ({ alerts }) => {
  return (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Tidak ada peringatan stok saat ini</p>
        </div>
      ) : (
        alerts.map((alert, index) => (
          <div key={index} className="border-l-4 border-red-400 bg-red-50 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Stok {alert.name} Menipis
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Stok saat ini: {alert.currentStock} {alert.unit}</p>
                  <p>Minimum stok: {alert.minStock} {alert.unit}</p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RecipeManagement;