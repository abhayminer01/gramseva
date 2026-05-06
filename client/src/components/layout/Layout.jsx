import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default Layout;
