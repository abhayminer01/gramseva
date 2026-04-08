import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, User, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-2xl tracking-tighter text-emerald-600">
              GRAM<span className="text-blue-600">SEVA</span>
            </span>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-gray-700 relative p-2">
                <Bell size={20} />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                  <User size={16} />
                </div>
                <div className="hidden md:block text-sm">
                  <p className="font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
              
              <button 
                onClick={logout}
                className="ml-4 text-gray-500 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
