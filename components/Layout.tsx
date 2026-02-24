import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Leaf, Calendar, Briefcase, Settings as SettingsIcon,
  DollarSign, Bell, BellOff, Receipt, Smile, Inbox, LogOut, LogIn,
  ShieldCheck, ChevronDown, ChevronRight, LayoutDashboard, Code2
} from 'lucide-react';
import { requestNotificationPermission, getNotificationPermissionState } from '../services/notificationService';
import { SUPER_ADMIN_EMAILS } from '../constants';
import Copilot from './Copilot';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import SaaSOnboarding from './SaaSOnboarding';
import UserProfileModal from './UserProfileModal';

interface LayoutProps {
  children: React.ReactNode;
}

/* ─── Admin nav dropdown group definitions ─── */
const adminGroups = [
  {
    label: 'Work',
    items: [
      { label: 'Schedule', path: '/admin/schedule', icon: <Calendar size={16} /> },
      { label: 'Leads', path: '/admin/leads', icon: <Inbox size={16} /> },
      { label: 'Jobs', path: '/admin/jobs', icon: <Briefcase size={16} /> },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Invoices', path: '/admin/invoices', icon: <DollarSign size={16} /> },
      { label: 'Expenses', path: '/admin/expenses', icon: <Receipt size={16} /> },
    ],
  },
  {
    label: 'Business',
    items: [
      { label: 'Customers', path: '/admin/customers', icon: <Smile size={16} /> },
      { label: 'Embed Widget', path: '/admin/embed-widget', icon: <Code2 size={16} /> },
    ],

  },
];

/* ─── Frontend (customer-facing) nav links ─── */
const frontendLinks = [
  { label: 'Features', path: '/features' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Book a Demo', path: '/book' },
];

/* ─── Dropdown component ─── */
const NavDropdown: React.FC<{
  label: string;
  items: { label: string; path: string; icon: React.ReactNode }[];
  isAnyActive: boolean;
  currentPath: string;
}> = ({ label, items, isAnyActive, currentPath }) => {
  const [open, setOpen] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const enter = () => { if (timeout.current) clearTimeout(timeout.current); setOpen(true); };
  const leave = () => { timeout.current = setTimeout(() => setOpen(false), 150); };

  // Close when route changes
  useEffect(() => { setOpen(false); }, [currentPath]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${isAnyActive
          ? 'text-lawn-700 bg-lawn-50'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
      >
        {label}
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Flyout */}
      <div
        className={`absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 transition-all duration-200 origin-top ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
      >
        {items.map((item) => {
          const active = currentPath.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium transition-colors ${active
                ? 'text-lawn-700 bg-lawn-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <span className={active ? 'text-lawn-600' : 'text-slate-400'}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [notificationState, setNotificationState] = useState<NotificationPermission>('default');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings, loading: jobsLoading } = useJobs();
  const overlayRef = useRef<HTMLDivElement>(null);

  const isCustomerView = location.pathname === '/' || location.pathname === '/book' || location.pathname === '/login' || location.pathname === '/features' || location.pathname === '/docs' || location.pathname === '/pricing' || location.pathname === '/contact' || location.pathname === '/legal' || location.pathname === '/help' || location.pathname.startsWith('/help/article') || location.pathname === '/status' || location.pathname === '/about' || location.pathname.startsWith('/toolkit') || location.pathname.startsWith('/founders');
  const isSuperAdmin = user?.email && SUPER_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email.toLowerCase());
  const showOnboarding = !isCustomerView && user && !isSuperAdmin && !jobsLoading && !settings.onboardingCompleted;

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    setNotificationState(getNotificationPermissionState());
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleNotificationToggle = async () => {
    if (notificationState === 'granted') return;
    const granted = await requestNotificationPermission();
    setNotificationState(granted ? 'granted' : 'denied');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (location.pathname.startsWith('/toolkit') || location.pathname.startsWith('/founders')) {
    return (
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    );
  }

  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '?';

  /* ─── All flat admin nav items (for mobile drawer) ─── */
  const allAdminItems = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} />, exact: true },
    ...adminGroups.flatMap(g => g.items.map(i => ({ ...i, icon: React.cloneElement(i.icon as React.ReactElement, { size: 18 }) }))),
    { label: 'Settings', path: '/admin/settings', icon: <SettingsIcon size={18} /> },
    ...(isSuperAdmin ? [{ label: 'Super Admin', path: '/super-admin', icon: <ShieldCheck size={18} /> }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ══════════ NAVBAR ══════════ */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/80'
          : 'bg-white border-b border-slate-200'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center" style={{ height: '52px' }}>

            {/* ── Logo ── */}
            <Link
              to={isCustomerView ? '/' : '/admin'}
              className="flex-shrink-0 flex items-center gap-2 group"
            >
              <div className="bg-gradient-to-br from-lawn-500 to-lawn-700 p-1.5 rounded-xl text-white shadow-sm group-hover:shadow-lawn-300 group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                <Leaf size={18} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-slate-800 tracking-tight">JobMow</span>
                  {!isCustomerView && (
                    <span className="bg-gradient-to-r from-lawn-500 to-emerald-600 text-[9px] font-black text-white px-1.5 py-0.5 rounded-md uppercase tracking-widest shadow-sm">Pro</span>
                  )}
                </div>
                {!isCustomerView && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">System Optimal</span>
                  </div>
                )}
              </div>
            </Link>

            {/* ── Desktop Center Nav ── */}
            {!isCustomerView ? (
              /* ── Admin: grouped dropdowns ── */
              <div className="hidden md:flex items-center gap-0.5">
                {/* Dashboard — standalone */}
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${isActive('/admin', true)
                    ? 'text-lawn-700 bg-lawn-50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                >
                  <LayoutDashboard size={15} className={isActive('/admin', true) ? 'text-lawn-600' : 'text-slate-400'} />
                  <span className="hidden lg:inline">Dashboard</span>
                </Link>

                {/* Dropdown groups */}
                {adminGroups.map((group) => {
                  const anyActive = group.items.some(i => location.pathname.startsWith(i.path));
                  return (
                    <NavDropdown
                      key={group.label}
                      label={group.label}
                      items={group.items}
                      isAnyActive={anyActive}
                      currentPath={location.pathname}
                    />
                  );
                })}

                {/* Settings — standalone */}
                <Link
                  to="/admin/settings"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${isActive('/admin/settings')
                    ? 'text-lawn-700 bg-lawn-50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  title="Settings"
                >
                  <SettingsIcon size={15} className={isActive('/admin/settings') ? 'text-lawn-600' : 'text-slate-400'} />
                  <span className="hidden lg:inline">Settings</span>
                </Link>

                {/* Super Admin — conditional */}
                {isSuperAdmin && (
                  <Link
                    to="/super-admin"
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${isActive('/super-admin')
                      ? 'text-lawn-700 bg-lawn-50'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    title="Super Admin"
                  >
                    <ShieldCheck size={15} className={isActive('/super-admin') ? 'text-lawn-600' : 'text-slate-400'} />
                    <span className="hidden lg:inline">Admin</span>
                  </Link>
                )}
              </div>
            ) : (
              /* ── Frontend: page links ── */
              <div className="hidden md:flex items-center gap-1">
                {frontendLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${location.pathname === link.path
                      ? 'text-lawn-700 bg-lawn-50'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* ── Right actions ── */}
            <div className="flex items-center gap-1.5">
              {!isCustomerView && user ? (
                <>
                  {/* Notification bell */}
                  <button
                    onClick={handleNotificationToggle}
                    className={`hidden md:flex relative p-2 rounded-lg transition-all duration-200 ${notificationState === 'granted'
                      ? 'text-lawn-600 bg-lawn-50 hover:bg-lawn-100'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                    title={notificationState === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
                  >
                    {notificationState === 'granted' ? <Bell size={16} /> : <BellOff size={16} />}
                    {notificationState === 'granted' && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white" />
                    )}
                  </button>

                  {/* Divider */}
                  <div className="hidden md:block h-5 w-px bg-slate-200 mx-0.5" />

                  {/* Avatar + logout */}
                  <div className="hidden md:flex items-center gap-1.5">
                    <button
                      onClick={() => setIsUserProfileOpen(true)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors tooltip-trigger"
                      title="Edit Profile"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-lawn-400 to-lawn-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm select-none">
                        {userInitials}
                      </div>
                      <span className="text-[13px] font-semibold text-slate-700 max-w-[120px] truncate">{user.name}</span>
                    </button>
                    <div className="h-5 w-px bg-slate-200 mx-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                      title="Logout"
                    >
                      <LogOut size={14} />
                      <span className="hidden lg:block">Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                !user && location.pathname !== '/login' ? (
                  <Link
                    to="/login"
                    className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold bg-lawn-600 text-white hover:bg-lawn-700 shadow-sm hover:shadow-lawn-300 hover:shadow-md transition-all duration-200"
                  >
                    <LogIn size={14} />
                    Admin Login
                  </Link>
                ) : null
              )}

              {/* ── Mobile hamburger ── */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:text-lawn-700 hover:bg-lawn-50 transition-all duration-200"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ══════════ MOBILE DRAWER ══════════ */}
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 left-0 z-[70] h-full w-[280px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-lawn-600 to-lawn-700">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Leaf size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="leading-none">
              <p className="font-extrabold text-white text-base">JobMow</p>
              {!isCustomerView && <p className="text-lawn-200 text-[9px] uppercase tracking-widest">Pro</p>}
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* User info strip (admin only) */}
        {!isCustomerView && user && (
          <button
            onClick={() => { setIsMobileMenuOpen(false); setIsUserProfileOpen(true); }}
            className="w-full flex items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100 hover:bg-slate-100 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lawn-400 to-lawn-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{isSuperAdmin ? '🛡️ Super Admin' : '✓ Logged in'}</p>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
        )}

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-2 px-3">
          {!isCustomerView ? (
            /* ── Admin mobile nav — grouped with section headers ── */
            <div className="space-y-1">
              {/* Dashboard */}
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive('/admin', true)
                  ? 'bg-lawn-50 text-lawn-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <span className={`flex-shrink-0 ${isActive('/admin', true) ? 'text-lawn-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  <LayoutDashboard size={18} />
                </span>
                <span className="flex-1">Dashboard</span>
                {isActive('/admin', true) && <ChevronRight size={14} className="text-lawn-500 flex-shrink-0" />}
              </Link>

              {/* Grouped sections */}
              {adminGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.label}</p>
                  {group.items.map((item) => {
                    const active = location.pathname.startsWith(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${active
                          ? 'bg-lawn-50 text-lawn-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                      >
                        <span className={`flex-shrink-0 ${active ? 'text-lawn-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                          {React.cloneElement(item.icon as React.ReactElement, { size: 18 })}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {active && <ChevronRight size={14} className="text-lawn-500 flex-shrink-0" />}
                      </Link>
                    );
                  })}
                </div>
              ))}

              {/* Settings */}
              <div>
                <p className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">System</p>
                <Link
                  to="/admin/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive('/admin/settings')
                    ? 'bg-lawn-50 text-lawn-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <span className={`flex-shrink-0 ${isActive('/admin/settings') ? 'text-lawn-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    <SettingsIcon size={18} />
                  </span>
                  <span className="flex-1">Settings</span>
                  {isActive('/admin/settings') && <ChevronRight size={14} className="text-lawn-500 flex-shrink-0" />}
                </Link>

                {isSuperAdmin && (
                  <Link
                    to="/super-admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive('/super-admin')
                      ? 'bg-lawn-50 text-lawn-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    <span className={`flex-shrink-0 ${isActive('/super-admin') ? 'text-lawn-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      <ShieldCheck size={18} />
                    </span>
                    <span className="flex-1">Super Admin</span>
                    {isActive('/super-admin') && <ChevronRight size={14} className="text-lawn-500 flex-shrink-0" />}
                  </Link>
                )}
              </div>
            </div>
          ) : (
            /* ── Frontend mobile nav ── */
            <div className="space-y-0.5">
              {frontendLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${location.pathname === link.path
                    ? 'bg-lawn-50 text-lawn-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Divider */}
              <div className="h-px bg-slate-100 my-2" />

              {!user && location.pathname !== '/login' && (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  <LogIn size={18} className="text-slate-400" />
                  Admin Login
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Drawer footer actions (admin only) */}
        {!isCustomerView && user && (
          <div className="border-t border-slate-100 px-3 py-2.5 space-y-0.5">
            <button
              onClick={() => { handleNotificationToggle(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${notificationState === 'granted'
                ? 'text-lawn-700 bg-lawn-50 hover:bg-lawn-100'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <span className={notificationState === 'granted' ? 'text-lawn-500' : 'text-slate-400'}>
                {notificationState === 'granted' ? <Bell size={18} /> : <BellOff size={18} />}
              </span>
              {notificationState === 'granted' ? 'Notifications On' : 'Enable Notifications'}
              {notificationState === 'granted' && (
                <span className="ml-auto w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
              )}
            </button>
            <button
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut size={18} className="text-slate-400" />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      {isCustomerView && <Footer />}

      {/* AI Copilot */}
      {!isCustomerView && <Copilot />}

      {/* SaaS Onboarding */}
      {showOnboarding && <SaaSOnboarding />}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
      />
    </div>
  );
};

export default Layout;