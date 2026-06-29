import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from './pages/ProfilePage';

// Components
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import ReportAnonymous from './pages/ReportAnonymous';
import ThreatMap from './pages/ThreatMap';

// Citizen Pages
import CitizenOverview from './pages/citizen/CitizenOverview';
import ReportIncident from './pages/citizen/ReportIncident';
import MyIncidents from './pages/citizen/MyIncidents';
import AIAssistantPage from './pages/citizen/AIAssistantPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIncidents from './pages/admin/AdminIncidents';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAlerts from './pages/admin/AdminAlerts';

// AI Tools
import PhishingDetector from './pages/tools/PhishingDetector';

// Detects Supabase recovery token in URL and redirects to reset page
function RecoveryRedirect({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Check URL hash SYNCHRONOUSLY during render (before landing page shows)
  const hash = window.location.hash;
  if (hash && hash.includes('type=recovery') && location.pathname !== '/reset-password') {
    return <Navigate to={'/reset-password' + hash} replace />;
  }

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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/report-anonymous" element={<ReportAnonymous />} />
        <Route path="/threat-map" element={<ThreatMap />} />

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
          <Route path="ai-assistant" element={<AIAssistantPage />} />
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
          <Route path="ai-assistant" element={<AIAssistantPage />} />
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
