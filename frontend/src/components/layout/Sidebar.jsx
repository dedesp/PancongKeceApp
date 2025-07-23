import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  Star,
  Headphones,
  Brain,
  TrendingUp,
  FileText,
  Settings
} from 'lucide-react';
import { clsx } from 'clsx';

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
    managerOnly: false
  },
  {
    id: 'pos',
    label: 'Point of Sales',
    icon: ShoppingCart,
    path: '/pos',
    managerOnly: false
  },
  {
    id: 'products',
    label: 'Manajemen Produk',
    icon: Package,
    path: '/products',
    managerOnly: true
  },
  {
    id: 'inventory',
    label: 'Inventaris',
    icon: Warehouse,
    path: '/inventory',
    managerOnly: true
  },
  {
    id: 'employees',
    label: 'Karyawan',
    icon: Users,
    path: '/employees',
    managerOnly: true
  },
  {
    id: 'customers',
    label: 'Customer',
    icon: Star,
    path: '/customers',
    managerOnly: true
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: Headphones,
    path: '/crm',
    managerOnly: true
  },
  {
    id: 'automation',
    label: 'AI & Automation',
    icon: Brain,
    path: '/automation',
    managerOnly: true
  },
  {
    id: 'finance',
    label: 'Keuangan',
    icon: TrendingUp,
    path: '/finance',
    managerOnly: true
  },
  {
    id: 'reports',
    label: 'Laporan',
    icon: FileText,
    path: '/reports',
    managerOnly: true
  },
  {
    id: 'settings',
    label: 'Pengaturan',
    icon: Settings,
    path: '/settings',
    managerOnly: false
  }
];

const Sidebar = ({ userRole = 'Kasir' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isManager = userRole === 'Manager' || userRole === 'Admin';

  const handleNavigation = (path) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location if navigate fails
      window.location.href = path;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen">
      <div className="p-4">
        {navigationItems.map((item) => {
          // Hide manager-only items for non-managers
          if (item.managerOnly && !isManager) {
            return null;
          }

          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={clsx(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 mb-1',
                isActive
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive ? 'text-primary-600' : 'text-gray-500')} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Sidebar;