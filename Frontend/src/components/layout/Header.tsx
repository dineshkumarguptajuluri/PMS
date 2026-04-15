import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, User, Bell } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-text-primary capitalize">
          {user?.role.toLowerCase()} Portal
        </h2>
      </div>

      <div className="flex items-center space-x-6">
        <button className="text-text-secondary hover:text-primary-blue transition-colors">
          <Bell size={20} />
        </button>
        
        <div className="flex items-center space-x-3 border-l pl-6 border-gray-100">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-text-primary">{user?.email.split('@')[0]}</span>
            <span className="text-xs text-text-muted capitalize">{user?.role.toLowerCase()}</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary-gradient flex items-center justify-center text-white">
            <User size={20} />
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-text-secondary hover:text-danger transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
