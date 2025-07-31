import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import RecipeManagement from './pages/RecipeManagement';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
      <p className="text-gray-600">Memuat halaman...</p>
    </div>
  </div>
);

// Placeholder components for other pages
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">Halaman ini sedang dalam pengembangan</p>
    </div>
  </div>
);

function App() {
  // Mock user data - in real app this would come from authentication
  const userData = {
    userRole: 'Manager',
    userName: 'Andi Pratama'
  };

  return (
    <ErrorBoundary>
      <Router>
        <Layout userRole={userData.userRole} userName={userData.userName}>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/products" element={<Products />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/recipe-management" element={<RecipeManagement />} />
              <Route path="/employees" element={<PlaceholderPage title="Karyawan" />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/crm" element={<PlaceholderPage title="CRM" />} />
              <Route path="/automation" element={<PlaceholderPage title="AI & Automation" />} />
              <Route path="/finance" element={<PlaceholderPage title="Keuangan" />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<PlaceholderPage title="Pengaturan" />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App
