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
  Zap,
  Lock,
  ScanSearch,
  Bot,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CyberBot from './CyberBot';


export default function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';

  const citizenLinks = [
    { to: '/dashboard', icon: Home, label: 'Overview' },
    { to: '/dashboard/ai-assistant', icon: Bot, label: 'AI Assistant', badge: 'NEW' },
    { to: '/dashboard/report', icon: FileWarning, label: 'Report Incident' },
    { to: '/dashboard/incidents', icon: FileWarning, label: 'My Reports' },
    { to: '/dashboard/phishing-detector', icon: ScanSearch, label: 'Phishing Detector', badge: 'AI' },
    { to: '/alerts', icon: AlertTriangle, label: 'Safety Alerts' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/incidents', icon: FileWarning, label: 'All Incidents' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/ai-assistant', icon: Bot, label: 'AI Assistant', badge: 'NEW' },
    { to: '/admin/alerts', icon: AlertTriangle, label: 'Manage Alerts' },
    { to: '/admin/phishing-detector', icon: ScanSearch, label: 'Phishing Detector', badge: 'AI' },
    { to: '/admin/profile', icon: User, label: 'Profile' },
  ];

  const links = isAdmin ? adminLinks : citizenLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen" style={{ background: 'var(--dark-bg)' }}>
      <CyberBot />
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 border-b" style={{ background: 'var(--dark-surface)', borderColor: 'var(--dark-border)' }}>
        <div className="flex items-center justify-between p-4">
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--cyber-blue)' }} className="transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full border flex items-center justify-center overflow-hidden" style={{ borderColor: 'var(--cyber-blue)', background: 'var(--cyber-blue-dim)', boxShadow: '0 0 12px var(--cyber-glow)' }}>
                <img src="/favicon.png" className="w-4 h-4 object-contain" />
              </div>
            </div>
            <span className="text-lg font-display font-bold text-white tracking-[0.15em]">CYBERSAFE</span>
          </Link>
          <div className="w-6" />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 flex flex-col border-r" style={{ background: 'var(--dark-surface)', borderColor: 'var(--dark-border)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--dark-border)' }}>
              <Link to="/" className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full border flex items-center justify-center overflow-hidden" style={{ borderColor: 'var(--cyber-blue)', background: 'var(--cyber-blue-dim)', boxShadow: '0 0 14px var(--cyber-glow)' }}>
                  <img src="/favicon.png" className="w-5 h-5 object-contain" />
                </div>
                <span className="text-base font-display font-bold text-white tracking-[0.15em]">CYBERSAFE</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
                  style={isActive(link.to) ? {
                    background: 'var(--cyber-blue-dim)',
                    color: 'var(--cyber-blue)',
                    borderLeft: '2px solid var(--cyber-blue)',
                    boxShadow: 'inset 4px 0 20px rgba(56,189,248,0.06)',
                  } : { color: '#64748b' }}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{link.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--dark-border)' }}>
              <div className="flex items-center gap-3 px-4 py-2 text-slate-500">
                <User className="w-5 h-5" />
                <span className="text-sm font-mono">{profile?.full_name || 'User'}</span>
              </div>
              <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 w-full cyber-btn-danger rounded-lg text-sm font-medium">
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
        <aside className="hidden lg:flex lg:flex-col lg:w-[270px] lg:fixed lg:inset-y-0 border-r" style={{ background: 'var(--dark-surface)', borderColor: 'var(--dark-border)' }}>

          {/* Logo Area — HUD Ring Style */}
          <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--dark-border)' }}>
            <Link to="/" className="flex items-center gap-3 group">
              {/* Circular HUD icon like the reference image */}
              <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'rgba(56,189,248,0.25)', boxShadow: '0 0 14px rgba(56,189,248,0.15), inset 0 0 14px rgba(56,189,248,0.05)' }} />
                {/* Inner ring */}
                <div className="absolute inset-1.5 rounded-full border" style={{ borderColor: 'rgba(56,189,248,0.15)' }} />
                {/* Icon */}
                <img src="/favicon.png" className="w-5 h-5 relative z-10 object-contain" style={{ filter: 'drop-shadow(0 0 5px rgba(56,189,248,0.6))' }} />
                {/* Live dot */}
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full live-dot" style={{ background: 'var(--cyber-green)' }} />
              </div>
              <div>
                <span className="text-sm font-display font-bold text-white tracking-[0.15em]">CYBERSAFE</span>
                <p className="text-[9px] font-mono tracking-[0.18em] uppercase mt-0.5" style={{ color: 'rgba(56,189,248,0.5)' }}>India · Secure Portal</p>
              </div>
            </Link>
          </div>

          {/* System Status */}
          <div className="px-4 pt-4">
            <div className="rounded-lg px-3 py-2.5 border" style={{ background: 'rgba(56,189,248,0.03)', borderColor: 'rgba(56,189,248,0.1)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: 'var(--cyber-green)' }} />
                  <span className="text-[10px] font-mono tracking-wider" style={{ color: 'var(--cyber-green)' }}>SYSTEM ONLINE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3" style={{ color: 'var(--cyber-blue)' }} />
                  <span className="text-[10px] font-mono" style={{ color: 'rgba(56,189,248,0.6)' }}>AI ACTIVE</span>
                </div>
              </div>
              {/* Circuit line decoration */}
              <div className="mt-2 flex gap-0.5">
                {[...Array(18)].map((_, i) => (
                  <div key={i} className="h-0.5 flex-1 rounded" style={{ background: i % 3 === 0 ? 'rgba(56,189,248,0.3)' : 'rgba(56,189,248,0.07)' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Section Label */}
          <div className="px-5 pt-5 pb-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-px" style={{ background: 'var(--cyber-blue)', opacity: 0.4 }} />
              <span className="text-[9px] font-mono tracking-[0.25em] uppercase" style={{ color: 'rgba(56,189,248,0.35)' }}>Navigation</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(56,189,248,0.06)' }} />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 pb-3 space-y-0.5 overflow-y-auto">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative"
                style={isActive(link.to) ? {
                  background: 'rgba(56,189,248,0.07)',
                  color: 'var(--cyber-blue)',
                } : { color: '#475569' }}
              >
                {isActive(link.to) && (
                  <>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r" style={{ background: 'var(--cyber-blue)', boxShadow: '0 0 8px rgba(56,189,248,0.6)' }} />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cyber-blue)', opacity: 0.4 }} />
                  </>
                )}
                <link.icon
                  className="w-[18px] h-[18px] transition-colors"
                  style={isActive(link.to) ? { filter: 'drop-shadow(0 0 4px rgba(56,189,248,0.5))' } : {}}
                />
                <span className="text-sm font-medium flex-1">{link.label}</span>
                {'badge' in link && (link as any).badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(56,189,248,0.15)', color: 'var(--cyber-blue)' }}>{(link as any).badge}</span>
                )}
                {isActive(link.to) && <ChevronRight className="w-3 h-3 opacity-40" />}
              </Link>
            ))}
          </nav>

          {/* Divider with circuit pattern */}
          <div className="mx-4 mb-1">
            <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.15), transparent)' }} />
          </div>

          {/* User Panel */}
          <div className="p-4">
            <div className="rounded-xl p-3.5 border" style={{ background: 'rgba(56,189,248,0.03)', borderColor: 'rgba(56,189,248,0.08)' }}>
              <div className="flex items-center gap-3 mb-3">
                {/* HUD-ring avatar */}
                <div className="relative w-9 h-9 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full border" style={{ borderColor: 'rgba(56,189,248,0.25)' }} />
                  <div className="absolute inset-1 rounded-full border flex items-center justify-center" style={{ borderColor: 'rgba(56,189,248,0.12)', background: 'rgba(56,189,248,0.06)' }}>
                    <User className="w-4 h-4" style={{ color: 'var(--cyber-blue)' }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'rgba(56,189,248,0.45)' }}>{profile?.role}</p>
                </div>
              </div>
              <Link
                to={isAdmin ? '/admin/profile' : '/dashboard/profile'}
                className="flex items-center gap-1.5 text-xs font-mono transition-colors hover:text-white"
                style={{ color: 'rgba(56,189,248,0.5)' }}
              >
                <User className="w-3 h-3" />
                <span>VIEW_PROFILE</span>
              </Link>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2.5 w-full cyber-btn-danger rounded-lg mt-2 text-sm font-medium justify-center"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-[270px] flex-1">
          <div className="min-h-screen relative cyber-grid-bg circuit-bg">
            {/* Top accent line */}
            <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.15) 30%, rgba(56,189,248,0.3) 50%, rgba(56,189,248,0.15) 70%, transparent)' }} />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
