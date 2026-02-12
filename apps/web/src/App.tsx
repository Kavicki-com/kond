import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import Residents from './pages/Residents';
import Units from './pages/Units';
import Invites from './pages/Invites';
import Settings from './pages/Settings';
import DashboardLayout from './layouts/DashboardLayout';
import { useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Checkout from './pages/Checkout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth(); // Removed role check from here for now to isolate issue

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--color-bg)' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/checkout" element={<Checkout />} />

      {/* Dashboard Routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="packages" element={<Packages />} />
        <Route path="residents" element={<Residents />} />
        <Route path="units" element={<Units />} />
        <Route path="invites" element={<Invites />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
