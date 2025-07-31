import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, Users, Package, DollarSign } from 'lucide-react';

const StatCard = ({ title, value, trend, trendValue, icon }) => {
  const IconComponent = icon;
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && trendValue && (
            <p className={`text-sm mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↗' : '↘'} {trendValue}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-50 rounded-lg">
          <IconComponent className="w-6 h-6 text-primary-600" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState([
    {
      title: 'Penjualan Hari Ini',
      value: 'Rp 0',
      icon: DollarSign,
      trend: null,
      trendValue: null
    },
    {
      title: 'Total Transaksi',
      value: '0',
      icon: TrendingUp,
      trend: null,
      trendValue: null
    },
    {
      title: 'Karyawan Aktif',
      value: '0',
      icon: Users,
      trend: null,
      trendValue: null
    },
    {
      title: 'Stok Rendah',
      value: '0',
      icon: Package,
      trend: null,
      trendValue: null
    }
  ]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data from database
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || 'mock-token-for-development'}`,
            'Content-Type': 'application/json'
          }
        });
        const result = await response.json();
        
        if (result.status === 'success') {
          const data = result.data;
          setStats([
            {
              title: 'Penjualan Hari Ini',
              value: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(data.today_sales || 0),
              icon: DollarSign,
              trend: data.today_sales_trend || null,
              trendValue: data.today_sales_trend_value || null
            },
            {
              title: 'Total Transaksi',
              value: (data.transaction_count || 0).toString(),
              icon: TrendingUp,
              trend: data.transaction_trend || null,
              trendValue: data.transaction_trend_value || null
            },
            {
              title: 'Karyawan Aktif',
              value: (data.employee_count || 0).toString(),
              icon: Users,
              trend: data.employee_trend || null,
              trendValue: data.employee_trend_value || null
            },
            {
              title: 'Stok Rendah',
              value: (data.low_stock_count || 0).toString(),
              icon: Package,
              trend: data.stock_trend || null,
              trendValue: data.stock_trend_value || null
            }
          ]);
        } else {
          console.error('Failed to fetch dashboard data:', result.message);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <LayoutDashboard className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Ringkasan aktivitas cafe hari ini</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))
        ) : (
          stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Buat Transaksi</p>
              <p className="text-sm text-gray-600">Mulai penjualan baru</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-green-50 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Kelola Produk</p>
              <p className="text-sm text-gray-600">Tambah atau edit produk</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Lihat Laporan</p>
              <p className="text-sm text-gray-600">Analisis penjualan</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h2>
        <div className="space-y-3">
          {[
            { time: '10:30', action: 'Transaksi #001234 - Rp 45.000', user: 'Andi Pratama' },
            { time: '10:15', action: 'Produk "Kopi Americano" ditambahkan', user: 'Manager' },
            { time: '09:45', action: 'Transaksi #001233 - Rp 32.000', user: 'Sari Dewi' },
            { time: '09:30', action: 'Shift dimulai', user: 'Andi Pratama' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-600">oleh {activity.user}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;