import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Package,
    Users,
    Building2,
    Mail,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/logo.png';
import './DashboardLayout.css';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/packages', icon: Package, label: 'Encomendas' },
    { to: '/dashboard/residents', icon: Users, label: 'Moradores' },
    { to: '/dashboard/units', icon: Building2, label: 'Unidades' },
    { to: '/dashboard/invites', icon: Mail, label: 'Convites' },
    { to: '/dashboard/settings', icon: Settings, label: 'Configurações' },
];

export default function DashboardLayout() {
    const { profile, condominium, signOut } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className={`dashboard-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src={logo} alt="Kond" style={{ height: 32, width: 'auto' }} />
                        {!collapsed && <span className="sidebar-logo-text" style={{ marginLeft: 10 }}>Kond</span>}
                    </div>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label="Toggle sidebar"
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                {!collapsed && condominium && (
                    <div className="sidebar-condo">
                        <span className="sidebar-condo-name">{condominium.name}</span>
                        <span className="badge badge-admin">{condominium.plan}</span>
                    </div>
                )}

                <nav className="sidebar-nav">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                            title={collapsed ? label : undefined}
                        >
                            <Icon size={20} />
                            {!collapsed && <span>{label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {!collapsed && (
                        <div className="sidebar-user">
                            <div className="sidebar-avatar">
                                {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="sidebar-user-info">
                                <span className="sidebar-user-name">{profile?.full_name || 'Admin'}</span>
                                <span className="sidebar-user-role">Administrador</span>
                            </div>
                        </div>
                    )}
                    <button className="sidebar-link logout-link" onClick={handleSignOut} title="Sair">
                        <LogOut size={20} />
                        {!collapsed && <span>Sair</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="mobile-nav">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/dashboard'}
                        className={({ isActive }) =>
                            `mobile-nav-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <Icon size={20} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Main Content */}
            <main className="main-content">
                {condominium?.subscription?.status === 'trialing' ? (
                    <div style={{ padding: '2rem', textAlign: 'center', maxWidth: 600, margin: '0 auto', marginTop: '10vh' }}>
                        <div style={{ fontSize: 64, marginBottom: '1rem' }}>⏳</div>
                        <h2 className="text-xl font-bold mb-md">Aguardando Pagamento</h2>
                        <p className="text-muted mb-lg">
                            Bem-vindo ao painel Kond! Verificamos que o pagamento da sua assinatura (Plano {condominium.plan}) ainda está em processamento ou aguardando pagamento.
                        </p>
                        <p className="text-muted mb-lg">
                            Se você pagou via Pix, a confirmação ocorre em poucos minutos através do nosso sistema seguro. 
                        </p>
                        <button className="btn btn-primary" onClick={() => window.location.reload()}>
                            Verificar Pagamento
                        </button>
                    </div>
                ) : (
                    <Outlet />
                )}
            </main>
        </div>
    );
}
