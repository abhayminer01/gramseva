import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Pickaxe, Megaphone } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  const getLinks = () => {
    const role = user?.role;
    let links = [
      { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    ];

    if (role === 'citizen') {
      links.push({ to: '/my-grievances', icon: <FileText size={20} />, label: 'My Grievances' });
      links.push({ to: '/mgnrega', icon: <Pickaxe size={20} />, label: 'MGNREGA' });
    } else {
      links.push({ to: '/grievances', icon: <FileText size={20} />, label: 'Manage Grievances' });
      links.push({ to: '/announcements', icon: <Megaphone size={20} />, label: 'Announcements' });
      if (['secretary', 'higher_authority'].includes(role)) {
         links.push({ to: '/mgnrega-requests', icon: <Pickaxe size={20} />, label: 'MGNREGA Requests' });
      }
    }

    return links;
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block h-[calc(100vh-4rem)] sticky top-16">
      <nav className="p-4 space-y-1">
        {getLinks().map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 font-medium ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
