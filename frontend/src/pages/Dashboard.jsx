import React from 'react';
import { LayoutDashboard, TrendingUp, Users, Package, DollarSign } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↗' : '↘'} {trendValue}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-50 rounded-lg">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const stats = [
    {
      title: 'Penjualan Hari Ini',
      value: 'Rp 2.450.000',
      icon: DollarSign,
      trend: 'up',
      trendValue: '+12%'
    },
    {
      title: 'Total Transaksi',
      value: '156',
      icon: TrendingUp,
      trend: 'up',
      trendValue: '+8%'
    },
    {
      title: 'Customer Aktif',
      value: '89',
      icon: Users,
      trend: 'up',
      trendValue: '+5%'
    },
    {
      title: 'Produk Terjual',
      value: '324',
      icon: Package,
      trend: 'down',
      trendValue: '-2%'
    }
  ];

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
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
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