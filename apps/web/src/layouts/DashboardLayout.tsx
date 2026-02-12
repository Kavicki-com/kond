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
import './DashboardLayout.css';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/packages', icon: Package, label: 'Encomendas' },
    { to: '/residents', icon: Users, label: 'Moradores' },
    { to: '/units', icon: Building2, label: 'Unidades' },
    { to: '/invites', icon: Mail, label: 'Convites' },
    { to: '/settings', icon: Settings, label: 'Configurações' },
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
                        <span className="sidebar-logo-icon">📦</span>
                        {!collapsed && <span className="sidebar-logo-text">Kond</span>}
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

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
