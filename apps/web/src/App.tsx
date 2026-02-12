import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import Residents from './pages/Residents';
import Units from './pages/Units';
import Invites from './pages/Invites';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, role, signOut } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'admin') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', gap: 'var(--space-md)', padding: 'var(--space-lg)',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: 48 }}>🔒</span>
        <h2>Acesso Restrito</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Este painel é exclusivo para administradores de condomínio.
        </p>
        <button
          className="btn btn-secondary"
          onClick={() => signOut()}
          style={{ marginTop: 'var(--space-md)' }}
        >
          Sair e trocar de conta
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
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
    </Routes>
  );
}
