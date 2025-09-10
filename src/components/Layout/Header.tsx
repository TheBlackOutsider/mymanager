import React from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  CalendarDays
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { logout } from '../../store/slices/authSlice';
import Button from '../Common/Button';

// Navigation based on user role
const getNavigationForRole = (role: string) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['employee', 'manager', 'hr_officer', 'hr_head'] },
    { name: 'Calendar', href: '/calendar', icon: CalendarDays, roles: ['employee', 'manager', 'hr_officer', 'hr_head'] },
    { name: 'My Leaves', href: '/my-leaves', icon: FileText, roles: ['employee', 'manager'] },
    { name: 'Events', href: '/events', icon: Calendar, roles: ['hr_officer', 'hr_head'] },
    { name: 'Attendance', href: '/attendance', icon: Users, roles: ['hr_officer', 'hr_head'] },
    { name: 'Employees', href: '/employees', icon: Users, roles: ['hr_officer', 'hr_head'] },
    { name: 'Leave Requests', href: '/leaves', icon: FileText, roles: ['manager', 'hr_officer', 'hr_head'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['hr_officer', 'hr_head'] },
    { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['employee', 'manager', 'hr_officer', 'hr_head'] },
  ];

  return baseNavigation.filter(item => item.roles.includes(role));
};

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const { user } = useAppSelector((state) => state.auth);
  
  const navigation = user ? getNavigationForRole(user.role) : [];

  const handleLogout = () => {
    dispatch(logout());
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      employee: 'Employee',
      manager: 'Manager',
      hr_officer: 'HR Officer',
      hr_head: 'HR Head',
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      {/* Top bar with logo and user info */}
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="flex items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HR</span>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">HR Management</h1>
              {user && (
                <p className="text-xs text-gray-500">{getRoleDisplayName(user.role)}</p>
              )}
            </div>
          </div>
          
          <div className="ml-8 flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search employees, events, leaves..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          <div className="relative">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.department}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation menu */}
      <nav className="px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
              {item.name}
              {item.name === 'Notifications' && unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[16px] text-center">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;