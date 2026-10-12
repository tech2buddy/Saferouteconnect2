import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { testSupabaseConnection } from './services/supabaseClient';

// Landing
import Landing from './components/landing/Landing';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyIdentity from './components/auth/VerifyIdentity';
import StaffLogin from './components/auth/StaffLogin';
import ResetPassword from './components/auth/ResetPassword';

// Main pages
import Dashboard from './components/dashboard/Dashboard';
import ReportIncident from './components/incidents/ReportIncident';
import IncidentList from './components/incidents/IncidentList';
import IncidentDetail from './components/incidents/IncidentDetail';
import IncidentManagement from './components/incidents/IncidentManagement';
import Feedback from './components/feedback/Feedback';
import SafeRoute from './components/routes/SafeRoute';
import Alerts from './components/alerts/Alerts';

// Admin
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import ReportsAnalytics from './components/admin/ReportsAnalytics';
import AuditLog from './components/admin/AuditLog';

// User pages
import Profile from './components/profile/Profile';
import Settings from './components/settings/Settings';
import Help from './components/help/Help';

// 404
import NotFound from './components/common/NotFound';

function App() {
  React.useEffect(() => {
    testSupabaseConnection();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-secondary-50">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#1e293b',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                padding: '16px',
              },
              success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
              error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Landing */}
            <Route path="/" element={<Landing />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/verify" element={<VerifyIdentity />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Resident pages */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/report-incident" element={<ProtectedRoute><ReportIncident /></ProtectedRoute>} />
            <Route path="/incidents" element={<ProtectedRoute><IncidentList /></ProtectedRoute>} />
            <Route path="/incidents/:id" element={<ProtectedRoute><IncidentDetail /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/safe-route" element={<ProtectedRoute><SafeRoute /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />

            {/* Admin/Coordinator pages */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/incidents" element={<ProtectedRoute adminOnly><IncidentManagement /></ProtectedRoute>} />
            <Route path="/admin/audit-log" element={<ProtectedRoute adminOnly><AuditLog /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute adminOnly><ReportsAnalytics /></ProtectedRoute>} />

            {/* Admin-ONLY pages */}
            <Route path="/admin/users" element={<ProtectedRoute strictAdmin><UserManagement /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;