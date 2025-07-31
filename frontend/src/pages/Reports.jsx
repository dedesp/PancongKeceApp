import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users, Calendar, Download, Filter, Eye } from 'lucide-react';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today'); // today, week, month, year, custom
  const [selectedReport, setSelectedReport] = useState('sales'); // sales, products, customers, inventory
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Removed mock report data - now using only database API calls

  // Load report data
  useEffect(() => {
    loadReportData();
  }, [selectedPeriod, selectedReport, loadReportData]);

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedPeriod === 'custom' && {
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate
        })
      });
      
      const response = await fetch(`/api/reports/${selectedReport}?${params}`);
      const result = await response.json();
      
      if (result.status === 'success') {
        setReportData(result.data);
      } else {
        console.error('Failed to fetch report data:', result.message);
        setReportData(null);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedReport, selectedPeriod, customDateRange]);

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
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  // Export report
  const exportReport = () => {
    // Simulate export functionality
    alert('Laporan akan diunduh dalam format PDF');
  };

  // Render sales report
  const renderSalesReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.summary.totalRevenue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalTransactions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rata-rata Transaksi</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.summary.averageTransaction)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pertumbuhan</p>
                <p className="text-2xl font-bold text-green-600">+{reportData.summary.growth}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Penjualan Harian</h3>
          <div className="space-y-3">
            {reportData.dailySales.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{formatDate(day.date)}</p>
                  <p className="text-sm text-gray-600">{day.transactions} transaksi</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(day.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Produk Terlaris</h3>
          <div className="space-y-3">
            {reportData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.quantity} terjual</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render products report
  const renderProductsReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Produk</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produk Aktif</p>
                <p className="text-2xl font-bold text-green-600">{reportData.summary.activeProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stok Rendah</p>
                <p className="text-2xl font-bold text-yellow-600">{reportData.summary.lowStockProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Habis</p>
                <p className="text-2xl font-bold text-red-600">{reportData.summary.outOfStockProducts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Performance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Performa Produk</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terjual</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendapatan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margin (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.performance.map((product, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{product.sold}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{formatCurrency(product.revenue)}</td>
                    <td className="px-4 py-4 text-sm text-green-600">{product.margin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render customers report
  const renderCustomersReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalCustomers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pelanggan Baru</p>
                <p className="text-2xl font-bold text-green-600">{reportData.summary.newCustomers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pelanggan Kembali</p>
                <p className="text-2xl font-bold text-purple-600">{reportData.summary.returningCustomers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Retensi</p>
                <p className="text-2xl font-bold text-yellow-600">{reportData.summary.customerRetention}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Pelanggan Teratas</h3>
          <div className="space-y-3">
            {reportData.topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.transactions} transaksi</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(customer.totalSpent)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render inventory report
  const renderInventoryReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Item</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalItems}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nilai Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.summary.totalValue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stok Rendah</p>
                <p className="text-2xl font-bold text-yellow-600">{reportData.summary.lowStockItems}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Habis</p>
                <p className="text-2xl font-bold text-red-600">{reportData.summary.outOfStockItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Movements */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Pergerakan Stok Terbaru</h3>
          <div className="space-y-3">
            {reportData.movements.map((movement, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    movement.type === 'in' ? 'bg-green-100' :
                    movement.type === 'out' ? 'bg-red-100' :
                    'bg-yellow-100'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${
                      movement.type === 'in' ? 'text-green-600' :
                      movement.type === 'out' ? 'text-red-600' :
                      'text-yellow-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{movement.product}</p>
                    <p className="text-sm text-gray-600">{movement.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    movement.type === 'in' ? 'text-green-600' :
                    movement.type === 'out' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}{Math.abs(movement.quantity)}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(movement.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan & Analitik</h1>
          <p className="text-gray-600">Analisis performa bisnis Sajati</p>
        </div>
        <button
          onClick={exportReport}
          className="btn btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Laporan
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="input"
            >
              <option value="sales">Laporan Penjualan</option>
              <option value="products">Laporan Produk</option>
              <option value="customers">Laporan Pelanggan</option>
              <option value="inventory">Laporan Inventaris</option>
            </select>
          </div>
          
          {/* Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Periode
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input"
            >
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="year">Tahun Ini</option>
              <option value="custom">Kustom</option>
            </select>
          </div>
          
          {/* Custom Date Range */}
          {selectedPeriod === 'custom' && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rentang Tanggal
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                  className="input flex-1"
                />
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                  className="input flex-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Memuat laporan...</div>
        </div>
      ) : (
        <div>
          {selectedReport === 'sales' && renderSalesReport()}
          {selectedReport === 'products' && renderProductsReport()}
          {selectedReport === 'customers' && renderCustomersReport()}
          {selectedReport === 'inventory' && renderInventoryReport()}
        </div>
      )}
    </div>
  );
};

export default Reports;