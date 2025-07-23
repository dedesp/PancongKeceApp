import React from 'react';
import { Home, UserCircle } from 'lucide-react';

const Header = ({ userRole = 'Kasir', userName = 'Andi Pratama' }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/Sajati_logo.jpg" alt="Sajati Logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-gray-900">Sajati Integrated Smart System</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-600">{userRole}</span>
          <UserCircle className="w-6 h-6 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">{userName}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;