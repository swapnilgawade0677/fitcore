import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { logout, fetchCurrentUser } from '../store/authSlice';
import { User, Menu, X, LogOut, LayoutDashboard, Users, Dumbbell, Calendar, CreditCard, Truck, Activity, MessageSquare, Star, Settings, ChevronDown, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { cn } from '../utils/helpers';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'member', 'trainer'] },
  { name: 'Members', href: '/members', icon: Users, roles: ['admin', 'trainer'] },
  { name: 'Trainers', href: '/trainers', icon: Dumbbell, roles: ['admin'] },
  { name: 'Plans', href: '/plans', icon: Calendar, roles: ['admin', 'member', 'trainer'] },
  { name: 'Attendance', href: '/attendance', icon: Calendar, roles: ['admin', 'member', 'trainer'] },
  { name: 'Payments', href: '/payments', icon: CreditCard, roles: ['admin', 'member'] },
  { name: 'Equipment', href: '/equipment', icon: Truck, roles: ['admin'] },
  { name: 'Workouts', href: '/workouts', icon: Activity, roles: ['admin', 'member', 'trainer'] },
  { name: 'Inquiries', href: '/inquiries', icon: MessageSquare, roles: ['admin', 'member'] },
  { name: 'Feedbacks', href: '/feedbacks', icon: Star, roles: ['admin'] },
  { name: 'Users', href: '/users', icon: ShieldCheck, roles: ['admin'] },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { stats } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setUserMenuOpen(false);
  };

  const filteredNav = navigation.filter((item) => item.roles.includes(user?.role || ''));

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Mobile sidebar overlay */}
      <div
        className={cn('fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden', sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-dark-100 border-r border-dark-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-dark-200">
            <NavLink to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-dark-900">Fit<span className="text-primary-600">Core</span></span>
            </NavLink>
            <button
              className="lg:hidden p-2 rounded-lg text-dark-500 hover:bg-dark-200"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
            {filteredNav.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => cn(
                  'sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-500 text-black font-semibold shadow-sm'
                    : 'text-dark-500 hover:bg-dark-200 hover:text-dark-900'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-dark-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-dark-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-dark-100 border-b border-dark-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              className="lg:hidden p-2 rounded-lg text-dark-500 hover:bg-dark-200"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              {/* Stats summary for admin */}
              {user?.role === 'admin' && stats && (
                <div className="hidden md:flex items-center gap-4 text-sm text-dark-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{stats.active_members}/{stats.total_members} Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    <span>{formatCurrency(stats.total_revenue)}</span>
                  </div>
                </div>
              )}

              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-dark-200 transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-dark-700">{user?.full_name}</span>
                  <ChevronDown className="w-4 h-4 text-dark-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-100 rounded-lg shadow-lg border border-dark-200 py-1 animate-scale-in">
                    <NavLink
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-dark-700 hover:bg-dark-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Profile
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}