import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FolderKanban, 
  MessageSquare, 
  BarChart3, 
  Compass, 
  Search,
  ClipboardList
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const getSidebarItems = (): SidebarItem[] => {
    if (!user) return [];

    switch (user.role) {
      case 'ADMIN':
        return [
          { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Users', path: '/admin/users', icon: Users },
          { label: 'Create Client', path: '/admin/clients/create', icon: UserPlus },
          { label: 'Onboarding Requests', path: '/admin/clients/onboarding-requests', icon: ClipboardList },
          { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
          { label: 'Interests', path: '/admin/interests', icon: MessageSquare },
          { label: 'Analytics', path: '/admin/performance', icon: BarChart3 },
        ];
      case 'MANAGER':
        return [
          { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
          { label: 'My Projects', path: '/manager/projects', icon: FolderKanban },
          { label: 'Clients', path: '/manager/clients', icon: Users },
          { label: 'Interests', path: '/manager/interests', icon: MessageSquare },
          { label: 'Create Client', path: '/manager/create-client', icon: UserPlus },
        ];
      case 'CLIENT':
        if (user.onboardingStatus !== 'APPROVED') {
          return [
            { label: 'Onboarding', path: '/client/onboarding', icon: ClipboardList },
          ];
        }
        return [
          { label: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
          { label: 'Discover Projects', path: '/projects/discovery', icon: Search },
          { label: 'My Projects', path: '/projects/active', icon: Compass },
          { label: 'My Interests', path: '/client/interests', icon: MessageSquare },
        ];
      default:
        return [];
    }
  };

  const items = getSidebarItems();

  return (
    <aside className="w-64 bg-bg-card border-r border-border-subtle flex flex-col h-[calc(100vh-64px)] overflow-y-auto sticky top-16 transition-colors">
      <nav className="flex-1 py-6 px-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-primary-blue/10 text-primary-blue'
                  : 'text-text-secondary hover:bg-bg-soft hover:text-text-primary'
              )
            }
          >
            <item.icon size={20} className="transition-transform group-hover:scale-110" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border-subtle">
        <div className="bg-bg-soft rounded-lg p-4">
          <p className="text-xs text-text-muted">System Status</p>
          <div className="flex items-center mt-1 space-x-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-text-secondary">Operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
