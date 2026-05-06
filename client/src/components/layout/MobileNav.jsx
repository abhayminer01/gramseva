import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Pickaxe, Megaphone, Users } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const MobileNav = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const getLinks = () => {
    const role = user?.role;
    let links = [
      { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Home' },
    ];

    if (role === 'citizen') {
      links.push({ to: '/my-grievances', icon: <FileText size={20} />, label: 'Issues' });
      links.push({ to: '/mgnrega', icon: <Pickaxe size={20} />, label: 'Work' });
    } else if (role === 'secretary') {
      links.push({ to: '/grievances', icon: <FileText size={20} />, label: 'Grievances' });
      links.push({ to: '/citizens', icon: <Users size={20} />, label: 'Citizens' });
    }

    links.push({ to: '/announcements', icon: <Megaphone size={20} />, label: 'Alerts' });

    return links;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-4 pb-safe">
      <div className="flex justify-around items-center h-16">
        {getLinks().map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors duration-200 ${
                isActive ? 'text-emerald-600' : 'text-gray-500'
              }`
            }
          >
            {link.icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
