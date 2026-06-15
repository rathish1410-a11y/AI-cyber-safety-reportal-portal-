import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, UserRole } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DEMO_SESSION_KEY = 'cybersafe-demo-session';

const demoAccounts: Record<'admin' | 'citizen', { email: string; password: string; fullName: string; role: UserRole }> = {
  admin: {
    email: 'admin@cybersafe.com',
    password: 'Admin@123',
    fullName: 'Admin User',
    role: 'admin',
  },
  citizen: {
    email: 'user@cybersafe.com',
    password: 'User@123',
    fullName: 'Citizen User',
    role: 'citizen',
  },
};

function createDemoProfile(email: string, role: UserRole): Profile {
  const account = role === 'admin' ? demoAccounts.admin : demoAccounts.citizen;

  return {
    id: role === 'admin' ? 'demo-admin-id' : 'demo-citizen-id',
    email,
    full_name: account.fullName,
    role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function createDemoUser(email: string, role: UserRole): User {
  const profile = createDemoProfile(email, role);

  return {
    id: profile.id,
    email,
    app_metadata: { role },
    user_metadata: { full_name: profile.full_name },
  } as User;
}

function createDemoSession(user: User): Session {
  return {
    access_token: 'demo-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'demo-refresh-token',
    user,
  } as Session;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSession = window.localStorage.getItem(DEMO_SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setUser(parsed.user);
        setProfile(parsed.profile);
        setSession(parsed.session);
        setLoading(false);
        return;
      } catch {
        window.localStorage.removeItem(DEMO_SESSION_KEY);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        (async () => {
          await fetchProfile(session.user.id);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    const normalizedEmail = email.toLowerCase();
    const demoAccount = Object.values(demoAccounts).find(
      (account) => account.email.toLowerCase() === normalizedEmail && account.password === password
    );

    if (demoAccount) {
      const nextProfile = createDemoProfile(email, demoAccount.role);
      const nextUser = createDemoUser(email, demoAccount.role);
      const nextSession = createDemoSession(nextUser);

      setUser(nextUser);
      setProfile(nextProfile);
      setSession(nextSession);
      setLoading(false);
      window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ user: nextUser, profile: nextProfile, session: nextSession }));
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signUp(email: string, password: string, fullName: string, role: UserRole) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.localStorage.removeItem(DEMO_SESSION_KEY);
    setUser(null);
    setProfile(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
