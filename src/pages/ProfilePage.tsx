import { useState } from 'react';
import { User, Mail, Shield, Calendar, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface ProfilePageProps {
  isAdmin?: boolean;
}

export default function ProfilePage({ isAdmin = false }: ProfilePageProps) {
  const { profile, user } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id);

    if (error) {
      setError('Failed to update profile. Please try again.');
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-slate-400">Manage your account details and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-[#0d1b2a]/80 border border-[rgba(56,189,248,0.1)] rounded-xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile?.full_name || 'User'}</h2>
              <p className="text-teal-100">{profile?.email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-300 text-sm">Profile updated successfully!</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[rgba(10,22,40,0.7)] border border-[rgba(56,189,248,0.1)] rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-[rgba(56,189,248,0.4)] focus:ring-1 focus:ring-[rgba(56,189,248,0.2)]"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full bg-slate-700/30 border border-[rgba(56,189,248,0.1)] rounded-lg pl-10 pr-4 py-3 text-slate-400 cursor-not-allowed"
              />
            </div>
            <p className="text-slate-500 text-xs mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Account Role</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1) || ''}
                disabled
                className="w-full bg-slate-700/30 border border-[rgba(56,189,248,0.1)] rounded-lg pl-10 pr-4 py-3 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Member Since</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : ''}
                disabled
                className="w-full bg-slate-700/30 border border-[rgba(56,189,248,0.1)] rounded-lg pl-10 pr-4 py-3 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || fullName === profile?.full_name}
              className="bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-[#0ea5e9]/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-[#0d1b2a]/80 border border-[rgba(56,189,248,0.1)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[rgba(56,189,248,0.1)]">
            <span className="text-slate-400">User ID</span>
            <span className="text-slate-300 font-mono text-sm">{profile?.id?.slice(0, 8)}...{profile?.id?.slice(-4)}</span>
          </div>
          {isAdmin && (
            <div className="flex items-center justify-between py-3 border-b border-[rgba(56,189,248,0.1)]">
              <span className="text-slate-400">Role Permissions</span>
              <span className="text-green-400">Full Admin Access</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
