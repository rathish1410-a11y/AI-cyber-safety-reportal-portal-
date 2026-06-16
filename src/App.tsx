import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

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

function AppRoutes() {
  return (
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
