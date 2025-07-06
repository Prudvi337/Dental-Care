import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Users as UsersIcon, Calendar as CalendarIcon, ClipboardList } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import React from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = user?.role === 'Admin' ? [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Patients', path: '/patients' },
    { name: 'Appointments', path: '/appointments' },
    { name: 'Calendar', path: '/calendar' }
  ] : [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Appointments', path: '/my-appointments' }
  ];

  // Custom logout handler to redirect to landing page
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="relative shadow-sm border-b bg-gradient-to-r from-blue-900 via-blue-700 to-blue-400">
        <div className="absolute inset-0 h-32 w-full z-0" style={{background: 'linear-gradient(90deg,#0f172a,#2563eb 60%,#38bdf8 100%)', filter: 'blur(8px)', opacity: 0.7}} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 bg-clip-text text-transparent">DentalCare</h1>
              </div>
              {/* Desktop Navigation */}
              <nav className="hidden md:ml-10 md:flex md:space-x-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-semibold transition-all relative overflow-hidden
                      ${location.pathname === item.path
                        ? 'text-white'
                        : 'text-blue-100 hover:text-white hover:bg-blue-600/30'}
                    `}
                  >
                    {item.name}
                    {location.pathname === item.path && (
                      <span className="absolute left-2 right-2 bottom-1 h-1 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-700 rounded-full animate-gradient-x" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs bg-gradient-to-r from-blue-100 via-blue-200 to-blue-50 !text-blue-700 px-3 py-1 rounded-full font-bold shadow-md border border-blue-200 uppercase tracking-wide animate-fade-in transition-all">
                {user?.role}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="hidden md:flex hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-700 hover:text-white focus:bg-gradient-to-r focus:from-blue-500 focus:to-blue-700 focus:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-200 via-blue-100 to-white/90 backdrop-blur-lg border-t border-blue-100 flex md:hidden justify-around items-center py-2 px-2 gap-1 shadow-2xl animate-fade-in" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
        {navigationItems.map((item) => {
          let icon = Home;
          if (item.name.toLowerCase().includes('patient')) icon = UsersIcon;
          if (item.name.toLowerCase().includes('calendar')) icon = CalendarIcon;
          if (item.name.toLowerCase().includes('appointment')) icon = ClipboardList;
          if (item.name.toLowerCase().includes('dashboard')) icon = Home;
          const isActive = location.pathname === item.path;
          let label = item.name.split(' ')[0];
          if (item.name === 'My Appointments') label = 'My Appointments';
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 px-2 py-1 rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-t from-blue-300 via-blue-200 to-white text-blue-700 shadow-lg animate-fade-in ring-2 ring-blue-300'
                  : 'text-blue-700 hover:bg-gradient-to-t hover:from-blue-100 hover:to-blue-200 hover:text-blue-900 focus:bg-gradient-to-t focus:from-blue-100 focus:to-blue-200 focus:text-blue-900'}
              `}
              style={isActive ? {boxShadow: '0 4px 24px 0 #60a5fa55'} : {}}
            >
              <span className={`mb-1 ${isActive ? 'animate-bounce' : ''}`}>{React.createElement(icon, { className: `h-6 w-6 text-blue-700` })}</span>
              <span className="text-xs font-semibold" style={{color: isActive ? '#2563eb' : undefined}}>{label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 px-2 py-1 rounded-lg text-blue-700 hover:bg-gradient-to-t hover:from-blue-100 hover:to-blue-200 hover:text-blue-900 focus:bg-gradient-to-t focus:from-blue-100 focus:to-blue-200 focus:text-blue-900 transition-all duration-200"
          style={{background: 'none'}}
        >
          <span className="mb-1"><LogOut className="h-6 w-6 text-blue-700" /></span>
          <span className="text-xs font-semibold text-blue-700">Logout</span>
        </button>
      </nav>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 mt-6 rounded-2xl shadow-2xl bg-white/80 backdrop-blur-md border border-gray-200 animate-fade-in mb-16 md:mb-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;
