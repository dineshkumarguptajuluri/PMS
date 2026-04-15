import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-main flex flex-col">
      {/* Header is shared across all dashboard views */}
      <Header />
      
      <div className="flex flex-1">
        {/* Fixed sidebar */}
        <Sidebar />
        
        {/* Main content area */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-2 duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
