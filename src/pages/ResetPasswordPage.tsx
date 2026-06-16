import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase automatically picks up the recovery token from the URL hash
    // and creates a session. We listen for the PASSWORD_RECOVERY event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check if we already have a session (in case the event already fired)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: 'var(--dark-bg)' }}>
        <div className="absolute inset-0 cyber-grid-bg pointer-events-none" />
        <div className="text-center relative z-10">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(52,211,153,0.15)', borderTopColor: 'var(--cyber-green)' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle className="w-9 h-9" style={{ color: 'var(--cyber-green)', filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.5))' }} />
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2 tracking-wider">PASSWORD UPDATED</h2>
          <p className="text-slate-500 font-mono text-sm">Redirecting to login<span className="terminal-cursor"></span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative" style={{ background: 'var(--dark-bg)' }}>
      <div className="absolute inset-0 cyber-grid-bg pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 40%, rgba(56,189,248,0.05) 0%, transparent 60%)'
      }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3 mb-6">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'rgba(56,189,248,0.3)', boxShadow: '0 0 20px rgba(56,189,248,0.15)' }} />
              <div className="absolute inset-2 rounded-full border" style={{ borderColor: 'rgba(56,189,248,0.12)' }} />
              <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden">
                <img src="/favicon.png" className="w-7 h-7 object-contain" style={{ filter: 'drop-shadow(0 0 5px rgba(56,189,248,0.5))' }} />
              </div>
            </div>
            <span className="text-xl font-display font-bold text-white tracking-[0.15em]">CYBERSAFE</span>
          </Link>
          <h1 className="text-xl font-bold text-white mb-1 font-mono tracking-wider">RESET PASSWORD</h1>
          <p className="text-slate-500 text-sm font-mono">Enter your new password below</p>
        </div>

        {/* Card */}
        <div className="cyber-card cyber-frame p-8" style={{ borderColor: 'rgba(56,189,248,0.12)' }}>
          <div className="absolute top-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)' }} />

          {!sessionReady ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'rgba(56,189,248,0.3)', borderTopColor: 'var(--cyber-blue)' }} />
              <p className="text-slate-400 font-mono text-sm">Verifying reset token...</p>
              <p className="text-slate-600 font-mono text-xs mt-2">If this takes too long, request a new reset link.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg p-4 flex items-center gap-3 border" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--cyber-red)' }} />
                  <p className="text-sm font-mono" style={{ color: '#fca5a5' }}>{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider mb-2" style={{ color: 'rgba(56,189,248,0.6)' }}>New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(56,189,248,0.4)' }} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    className="cyber-input w-full rounded-lg pl-10 pr-12 py-3"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'rgba(56,189,248,0.4)' }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-mono uppercase tracking-wider mb-2" style={{ color: 'rgba(56,189,248,0.6)' }}>Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(56,189,248,0.4)' }} />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    className="cyber-input w-full rounded-lg pl-10 pr-4 py-3"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full cyber-btn-solid py-3 rounded-lg font-semibold font-mono tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />UPDATING...</>
                ) : 'SET NEW PASSWORD'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm font-mono">
              Remember your password?{' '}
              <Link to="/login" className="font-medium transition-colors" style={{ color: 'var(--cyber-blue)' }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
