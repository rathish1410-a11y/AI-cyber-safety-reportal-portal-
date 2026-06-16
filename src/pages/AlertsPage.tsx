import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Shield, Clock, ArrowRight, Radio } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../types/database';

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAlerts(); }, []);

  async function fetchAlerts() {
    const { data } = await supabase.from('alerts').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (data) setAlerts(data);
    setLoading(false);
  }

  const getSeverityStyle = (severity: string) => {
    const s = {
      low:      { borderColor: 'rgba(56,189,248,0.4)',  bg: 'rgba(56,189,248,0.03)',  badgeBg: 'rgba(56,189,248,0.1)',  badgeColor: 'var(--cyber-blue)',  iconColor: 'var(--cyber-blue)' },
      medium:   { borderColor: 'rgba(245,158,11,0.5)',  bg: 'rgba(245,158,11,0.03)',  badgeBg: 'rgba(245,158,11,0.1)',  badgeColor: 'var(--cyber-amber)', iconColor: 'var(--cyber-amber)' },
      high:     { borderColor: 'rgba(249,115,22,0.5)',  bg: 'rgba(249,115,22,0.03)',  badgeBg: 'rgba(249,115,22,0.1)',  badgeColor: '#fb923c',            iconColor: '#fb923c' },
      critical: { borderColor: 'rgba(239,68,68,0.6)',   bg: 'rgba(239,68,68,0.04)',   badgeBg: 'rgba(239,68,68,0.1)',   badgeColor: 'var(--cyber-red)',   iconColor: 'var(--cyber-red)' },
    };
    return s[severity as keyof typeof s] || s.medium;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--dark-bg)' }}>
      <div className="absolute inset-0 cyber-grid-bg pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 20%, rgba(56,189,248,0.04) 0%, transparent 50%)'
      }} />

      {/* Header */}
      <header className="border-b sticky top-0 z-50 backdrop-blur-md relative" style={{ background: 'rgba(6,14,26,0.85)', borderColor: 'rgba(56,189,248,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border" style={{ borderColor: 'rgba(56,189,248,0.3)', boxShadow: '0 0 10px rgba(56,189,248,0.15)' }} />
                <div className="absolute inset-1.5 rounded-full flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.08)' }}>
                  <Shield className="w-3.5 h-3.5" style={{ color: 'var(--cyber-blue)' }} />
                </div>
              </div>
              <span className="text-base font-display font-bold text-white tracking-[0.15em]">CYBERSAFE</span>
            </Link>
            <nav>
              {user ? (
                <Link to="/dashboard" className="cyber-btn-solid px-4 py-2 rounded-lg text-sm font-mono font-semibold">DASHBOARD</Link>
              ) : (
                <Link to="/login" className="text-sm font-mono transition-colors" style={{ color: 'rgba(56,189,248,0.7)' }}>LOGIN</Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--cyber-blue)' }} />
            <Radio className="w-4 h-4" style={{ color: 'rgba(56,189,248,0.6)' }} />
            <span className="text-xs font-mono tracking-wider" style={{ color: 'rgba(56,189,248,0.6)' }}>LIVE SECURITY FEED</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-3 tracking-wider">SAFETY ALERTS</h1>
          <p className="text-slate-500 font-mono text-sm">
            Stay informed about the latest cyber threats and security advisories from our team.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(56,189,248,0.1)', borderTopColor: 'var(--cyber-blue)' }} />
            </div>
            <span className="terminal-text text-xs" style={{ color: 'rgba(56,189,248,0.5)' }}>LOADING ALERTS<span className="terminal-cursor"></span></span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="cyber-card cyber-frame p-12 text-center">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border" style={{ borderColor: 'rgba(56,189,248,0.1)' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" style={{ color: 'rgba(56,189,248,0.2)' }} />
              </div>
            </div>
            <p className="text-slate-400 font-mono mb-1">NO_ACTIVE_ALERTS</p>
            <p className="text-slate-600 text-xs font-mono">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const style = getSeverityStyle(alert.severity);
              return (
                <div
                  key={alert.id}
                  className="cyber-card p-6 transition-all"
                  style={{ borderLeft: `2px solid ${style.borderColor}`, background: style.bg }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span
                          className="cyber-badge"
                          style={{ background: style.badgeBg, color: style.badgeColor, border: `1px solid ${style.borderColor}` }}
                        >
                          {alert.severity} severity
                        </span>
                        <span className="text-slate-600 text-xs font-mono flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {formatDate(alert.created_at)}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-white mb-2">{alert.title}</h2>
                      <p className="text-slate-400 text-sm leading-relaxed">{alert.content}</p>
                    </div>
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <div className="absolute inset-0 rounded-full border" style={{ borderColor: style.borderColor, opacity: 0.3 }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" style={{ color: style.iconColor }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        {!user && (
          <div className="mt-12 cyber-card cyber-frame p-8 text-center relative overflow-hidden" style={{ borderColor: 'rgba(56,189,248,0.15)' }}>
            <div className="absolute inset-0 cyber-grid-bg opacity-50 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-2xl font-display font-bold text-white mb-3 tracking-wider">REPORT A CYBER INCIDENT</h2>
              <p className="mb-6 text-sm font-mono" style={{ color: 'rgba(56,189,248,0.5)' }}>
                If you've encountered a cyber threat, report it now and help protect others.
              </p>
              <Link to="/signup" className="cyber-btn-solid inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold font-mono">
                CREATE ACCOUNT
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t mt-12 relative" style={{ background: 'rgba(6,14,26,0.8)', borderColor: 'rgba(56,189,248,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: 'var(--cyber-blue)' }} />
              <span className="text-white font-mono font-semibold text-sm tracking-wider">CYBERSAFE INDIA</span>
            </div>
            <p className="text-slate-600 text-xs font-mono">Smart India Hackathon 2024</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
