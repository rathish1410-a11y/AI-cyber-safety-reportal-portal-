import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: 'var(--dark-bg)' }}>
      {/* Background grid */}
      <div className="absolute inset-0 cyber-grid-bg opacity-100 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 40%, rgba(56,189,248,0.06) 0%, transparent 60%)'
      }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3 mb-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'rgba(56,189,248,0.3)', boxShadow: '0 0 20px rgba(56,189,248,0.2)' }} />
              <div className="absolute inset-2 rounded-full border" style={{ borderColor: 'rgba(56,189,248,0.15)' }} />
              <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden">
                <img src="/favicon.png" className="w-8 h-8 object-contain" style={{ filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.6))' }} />
              </div>
            </div>
            <span className="text-xl font-display font-bold text-white tracking-[0.15em]">CYBERSAFE</span>
          </Link>
          <h1 className="text-xl font-bold text-white mb-1 font-mono tracking-wider">SECURE ACCESS</h1>
          <p className="text-slate-500 text-sm font-mono">Sign in to access your dashboard</p>
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

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider mb-2" style={{ color: 'rgba(56,189,248,0.6)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(56,189,248,0.4)' }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="cyber-input w-full rounded-lg pl-10 pr-4 py-3"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider mb-2" style={{ color: 'rgba(56,189,248,0.6)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(56,189,248,0.4)' }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="cyber-input w-full rounded-lg pl-10 pr-12 py-3"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(56,189,248,0.4)' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-xs font-mono transition-colors hover:underline" style={{ color: 'rgba(56,189,248,0.5)' }}>
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Role switcher removed */}
            <button
              type="submit"
              disabled={loading}
              className="w-full cyber-btn-solid py-3 rounded-lg font-semibold font-mono tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  AUTHENTICATING...
                </>
              ) : (
                'SIGN IN'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm font-mono">
              No account?{' '}
              <Link to="/signup" className="font-medium transition-colors" style={{ color: 'var(--cyber-blue)' }}>
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
