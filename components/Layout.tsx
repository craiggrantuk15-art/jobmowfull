import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, Calendar, Briefcase, Settings as SettingsIcon, DollarSign, Bell, BellOff, Receipt, Smile, Inbox } from 'lucide-react';
import { requestNotificationPermission, getNotificationPermissionState } from '../services/notificationService';
import Copilot from './Copilot';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationState, setNotificationState] = useState<NotificationPermission>('default');
  const location = useLocation();

  const isCustomerView = location.pathname === '/' || location.pathname === '/book';

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: <Leaf size={20} /> },
    { label: 'Schedule', path: '/admin/schedule', icon: <Calendar size={20} /> },
    { label: 'Leads', path: '/admin/leads', icon: <Inbox size={20} /> },
    { label: 'Jobs', path: '/admin/jobs', icon: <Briefcase size={20} /> },
    { label: 'Customers', path: '/admin/customers', icon: <Smile size={20} /> },
    { label: 'Invoices', path: '/admin/invoices', icon: <DollarSign size={20} /> },
    { label: 'Expenses', path: '/admin/expenses', icon: <Receipt size={20} /> },
    { label: 'Settings', path: '/admin/settings', icon: <SettingsIcon size={20} /> },
  ];

  useEffect(() => {
    setNotificationState(getNotificationPermissionState());
  }, []);

  const handleNotificationToggle = async () => {
    if (notificationState === 'granted') {
        // Can't programmatically revoke, but we can show state
        return; 
    }
    const granted = await requestNotificationPermission();
    setNotificationState(granted ? 'granted' : 'denied');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-lawn-500 p-1.5 rounded-lg text-white">
                  <Leaf size={24} />
                </div>
                <span className="font-bold text-xl text-slate-800 tracking-tight">JobMow</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              {!isCustomerView ? (
                <>
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-2 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                        location.pathname === item.path
                          ? 'text-lawn-700 bg-lawn-50'
                          : 'text-slate-600 hover:text-lawn-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                  <div className="h-6 w-px bg-slate-200 mx-2"></div>
                  
                  {/* Notification Toggle */}
                  <button 
                    onClick={handleNotificationToggle}
                    className={`relative p-2 rounded-full transition-colors ${
                        notificationState === 'granted' 
                        ? 'text-lawn-600 bg-lawn-50 hover:bg-lawn-100' 
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                    title={notificationState === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
                  >
                    {notificationState === 'granted' ? <Bell size={20} /> : <BellOff size={20} />}
                    {notificationState === 'granted' && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    )}
                  </button>
                </>
              ) : (
                <Link
                  to="/admin"
                  className="text-sm font-medium text-slate-500 hover:text-lawn-600 transition-colors"
                >
                  Admin Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-lawn-600 hover:bg-slate-100 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 max-h-[80vh] overflow-y-auto">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-lg">
              {!isCustomerView ? (
                <>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${
                      location.pathname === item.path
                        ? 'text-lawn-700 bg-lawn-50'
                        : 'text-slate-600 hover:text-lawn-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                <button 
                    onClick={() => {
                        handleNotificationToggle();
                        setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-slate-600 hover:text-lawn-600 hover:bg-slate-50"
                >
                    {notificationState === 'granted' ? <Bell size={20} /> : <BellOff size={20} />}
                    {notificationState === 'granted' ? 'Notifications On' : 'Enable Notifications'}
                </button>
                </>
              ) : (
                <Link
                   to="/admin"
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="block px-3 py-3 rounded-md text-base font-medium text-slate-600 hover:text-lawn-600 hover:bg-slate-50"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* AI Copilot - Only show in Admin view */}
      {!isCustomerView && <Copilot />}
    </div>
  );
};

export default Layout;