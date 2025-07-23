import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, userRole, userName }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header userRole={userRole} userName={userName} />
      
      <div className="flex">
        <Sidebar userRole={userRole} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;