import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  Home,
  FileWarning,
  AlertTriangle,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';

  const citizenLinks = [
    { to: '/dashboard', icon: Home, label: 'Overview' },
    { to: '/dashboard/report', icon: FileWarning, label: 'Report Incident' },
    { to: '/dashboard/incidents', icon: FileWarning, label: 'My Reports' },
    { to: '/alerts', icon: AlertTriangle, label: 'Safety Alerts' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/incidents', icon: FileWarning, label: 'All Incidents' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/alerts', icon: AlertTriangle, label: 'Manage Alerts' },
    { to: '/admin/profile', icon: User, label: 'Profile' },
  ];

  const links = isAdmin ? adminLinks : citizenLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Header */}
      <header className="lg:hidden bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-teal-400" />
            <span className="text-lg font-bold text-white">CyberSafe</span>
          </Link>
          <div className="w-6" />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-slate-800 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <Link to="/" className="flex items-center gap-2">
                <Shield className="w-7 h-7 text-teal-400" />
                <span className="text-lg font-bold text-white">CyberSafe</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(link.to)
                      ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-400'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-700 space-y-2">
              <div className="flex items-center gap-3 px-4 py-2 text-slate-400">
                <User className="w-5 h-5" />
                <span className="text-sm">{profile?.full_name || 'User'}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-800 border-r border-slate-700">
          <div className="flex items-center gap-2 p-6 border-b border-slate-700">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-teal-400" />
              <div>
                <span className="text-lg font-bold text-white">CyberSafe India</span>
                <p className="text-xs text-slate-400">Security Reporting Portal</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(link.to)
                    ? 'bg-teal-500/10 text-teal-400'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
                {isActive(link.to) && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-700">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{profile?.full_name || 'User'}</p>
                  <p className="text-slate-400 text-xs capitalize">{profile?.role}</p>
                </div>
              </div>
              <Link
                to={isAdmin ? '/admin/profile' : '/dashboard/profile'}
                className="text-teal-400 text-sm hover:text-teal-300 flex items-center gap-1"
              >
                <User className="w-4 h-4" />
                View Profile
              </Link>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-64 flex-1">
          <div className="min-h-screen">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
