import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { FileProvider } from '../contexts/FileContext';

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <FileProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </FileProvider>
      )}
      
      {!user && <Outlet />}
    </div>
  );
};

export default MainLayout;