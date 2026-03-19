import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  History, 
  LogOut, 
  Users, 
  FileText 
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const teacherLinks = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/students', icon: <Users size={20} />, label: 'All Students' },
    { to: '/reports', icon: <FileText size={20} />, label: 'Reports' },
  ];

  const studentLinks = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'My Stats' },
    { to: '/attendance', icon: <UserCheck size={20} />, label: 'Mark Attendance' },
    { to: '/history', icon: <History size={20} />, label: 'Attendance History' },
  ];

  const links = role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <div className="w-64 h-screen bg-[#1e293b] border-r border-[#334155] flex flex-col">
      <div className="p-6 border-b border-[#334155]">
        <h1 className="text-xl font-bold text-blue-500 uppercase tracking-wider">Attendance AI</h1>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-[#94a3b8] hover:bg-[#334155] hover:text-white'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-[#334155]">
        <div className="flex items-center space-x-3 px-4 py-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {userName ? userName[0] : 'U'}
          </div>
          <div className="truncate">
            <p className="text-sm font-medium text-white">{userName || 'User'}</p>
            <p className="text-xs text-[#94a3b8] capitalize">{role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
