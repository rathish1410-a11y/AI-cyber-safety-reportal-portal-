import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Shield, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../types/database';

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) setAlerts(data);
    setLoading(false);
  }

  const getSeverityStyles = (severity: string) => {
    const styles = {
      low: {
        border: 'border-l-slate-500',
        bg: 'bg-slate-500/5',
        badge: 'bg-slate-500/20 text-slate-300',
        icon: 'text-slate-400',
      },
      medium: {
        border: 'border-l-yellow-500',
        bg: 'bg-yellow-500/5',
        badge: 'bg-yellow-500/20 text-yellow-300',
        icon: 'text-yellow-400',
      },
      high: {
        border: 'border-l-orange-500',
        bg: 'bg-orange-500/5',
        badge: 'bg-orange-500/20 text-orange-300',
        icon: 'text-orange-400',
      },
      critical: {
        border: 'border-l-red-500',
        bg: 'bg-red-500/5',
        badge: 'bg-red-500/20 text-red-300',
        icon: 'text-red-400',
      },
    };
    return styles[severity as keyof typeof styles] || styles.medium;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-teal-400" />
              <span className="text-xl font-bold text-white">CyberSafe India</span>
            </Link>
            <nav className="flex items-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white font-medium"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-teal-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Safety Advisories</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Safety Alerts</h1>
          <p className="text-slate-400">
            Stay informed about the latest cyber threats and security advisories from our team.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No active safety alerts at this time</p>
            <p className="text-slate-500 text-sm">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const styles = getSeverityStyles(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`border-l-4 ${styles.border} ${styles.bg} bg-slate-800/50 border border-slate-700 rounded-xl p-6`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full capitalize ${styles.badge}`}
                        >
                          {alert.severity} severity
                        </span>
                        <span className="text-slate-500 text-sm flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(alert.created_at)}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-white mb-2">{alert.title}</h2>
                      <p className="text-slate-300 leading-relaxed">{alert.content}</p>
                    </div>
                    <AlertTriangle className={`w-6 h-6 ${styles.icon} flex-shrink-0 mt-1`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA for non-logged users */}
        {!user && (
          <div className="mt-12 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Report a Cyber Incident</h2>
            <p className="text-teal-100 mb-6">
              If you've encountered a cyber threat, report it now and help protect others.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-white text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
            >
              Create Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-teal-400" />
              <span className="text-white font-semibold">CyberSafe India</span>
            </div>
            <p className="text-slate-400 text-sm">Smart India Hackathon 2024</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
