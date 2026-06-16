import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { supabase } from './lib/supabase';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from './pages/ProfilePage';

// Components
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Citizen Pages
import CitizenOverview from './pages/citizen/CitizenOverview';
import ReportIncident from './pages/citizen/ReportIncident';
import MyIncidents from './pages/citizen/MyIncidents';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIncidents from './pages/admin/AdminIncidents';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAlerts from './pages/admin/AdminAlerts';

// AI Tools
import PhishingDetector from './pages/tools/PhishingDetector';

// Detects Supabase recovery token in URL and redirects to reset page
function RecoveryRedirect({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check URL hash for recovery token (Supabase appends #access_token=...&type=recovery)
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      // Redirect to reset-password page, keeping the hash so Supabase can pick up the token
      navigate('/reset-password' + hash, { replace: true });
      return;
    }

    // Also listen for PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' && location.pathname !== '/reset-password') {
        navigate('/reset-password', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <RecoveryRedirect>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/alerts" element={<AlertsPage />} />

        {/* Citizen Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CitizenOverview />} />
          <Route path="report" element={<ReportIncident />} />
          <Route path="incidents" element={<MyIncidents />} />
          <Route path="phishing-detector" element={<PhishingDetector />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="incidents" element={<AdminIncidents />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="alerts" element={<AdminAlerts />} />
          <Route path="phishing-detector" element={<PhishingDetector />} />
          <Route path="profile" element={<ProfilePage isAdmin />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RecoveryRedirect>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
