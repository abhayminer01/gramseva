import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, User, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user && user.role === 'citizen') {
      axios.get('http://localhost:5000/api/announcements')
        .then(res => {
          let data = res.data;
          data = data.slice(0, 2);
          setAnnouncements(data);
        })
        .catch(err => console.error("Error fetching announcements", err));
    }
  }, [user]);


  return (
    <nav className="bg-white shadow border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent sm:block">
                GramSeva
              </span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center gap-2 sm:gap-4">
              {user?.role === 'citizen' && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="text-gray-500 hover:text-gray-700 relative p-2 focus:outline-none"
                  >
                    <Bell size={20} />
                    {announcements.length > 0 && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">Announcements</h3>
                        <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{announcements.length}</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {announcements.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            No recent announcements.
                          </div>
                        ) : (
                          announcements.map((ann, idx) => (
                            <div key={ann._id || idx} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">{ann.type || 'Alert'}</p>
                              <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1">{ann.title}</h4>
                              <p className="text-xs text-gray-600 line-clamp-2">{ann.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-xs">
                  <p className="font-bold text-gray-700 leading-tight">{user.name}</p>
                  <p className="text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
