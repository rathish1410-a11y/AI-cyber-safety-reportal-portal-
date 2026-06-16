import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: 'var(--dark-bg)' }}>
        <div className="absolute inset-0 cyber-grid-bg pointer-events-none" />
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="relative w-14 h-14 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'rgba(52,211,153,0.3)', boxShadow: '0 0 20px rgba(52,211,153,0.15)' }} />
              <div className="absolute inset-0 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7" style={{ color: 'var(--cyber-green)', filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.5))' }} />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-3 tracking-wider">CHECK YOUR EMAIL</h2>
          </div>

          <div className="cyber-card cyber-frame p-8 text-center" style={{ borderColor: 'rgba(52,211,153,0.15)' }}>
            <div className="absolute top-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent)' }} />

            <div className="w-16 h-16 rounded-full border mx-auto mb-5 flex items-center justify-center" style={{ borderColor: 'rgba(56,189,248,0.2)', background: 'rgba(56,189,248,0.05)' }}>
              <Mail className="w-7 h-7" style={{ color: 'var(--cyber-blue)' }} />
            </div>

            <p className="text-slate-300 text-sm font-mono mb-2">
              We've sent a password reset link to:
            </p>
            <p className="text-white font-mono font-semibold mb-5" style={{ color: 'var(--cyber-blue)' }}>
              {email}
            </p>
            <p className="text-slate-500 text-xs font-mono mb-6 leading-relaxed">
              Click the link in the email to reset your password.
              <br />If you don't see it, check your spam folder.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => { setSuccess(false); setEmail(''); }}
                className="w-full cyber-btn py-2.5 rounded-lg font-mono text-sm"
              >
                TRY ANOTHER EMAIL
              </button>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm font-mono transition-colors py-2"
                style={{ color: 'rgba(56,189,248,0.6)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                BACK TO LOGIN
              </Link>
            </div>
          </div>
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
          <h1 className="text-xl font-bold text-white mb-1 font-mono tracking-wider">FORGOT PASSWORD</h1>
          <p className="text-slate-500 text-sm font-mono">Enter your email to receive a reset link</p>
        </div>

        {/* Card */}
        <div className="cyber-card cyber-frame p-8" style={{ borderColor: 'rgba(56,189,248,0.12)' }}>
          <div className="absolute top-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)' }} />

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg p-4 flex items-center gap-3 border" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--cyber-red)' }} />
                <p className="text-sm font-mono" style={{ color: '#fca5a5' }}>{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider mb-2" style={{ color: 'rgba(56,189,248,0.6)' }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(56,189,248,0.4)' }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="cyber-input w-full rounded-lg pl-10 pr-4 py-3"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full cyber-btn-solid py-3 rounded-lg font-semibold font-mono tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />SENDING...</>
              ) : 'SEND RESET LINK'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-mono transition-colors"
              style={{ color: 'var(--cyber-blue)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
