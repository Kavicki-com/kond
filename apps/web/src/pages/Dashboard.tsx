import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Package, TrendingUp, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import './Dashboard.css';

interface Stats {
    totalPackages: number;
    pendingPackages: number;
    todayPackages: number;
    overduePackages: number;
    totalResidents: number;
    totalUnits: number;
}

interface RecentPackage {
    id: string;
    carrier: string | null;
    recipient_name: string | null;
    status: string;
    registered_at: string;
    volume_type: string;
    unit: {
        number: string;
        block: { name: string };
    };
}

export default function Dashboard() {
    const { condominium } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalPackages: 0, pendingPackages: 0, todayPackages: 0,
        overduePackages: 0, totalResidents: 0, totalUnits: 0,
    });
    const [recentPackages, setRecentPackages] = useState<RecentPackage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (condominium) loadDashboard();
    }, [condominium]);

    const loadDashboard = async () => {
        if (!condominium) return;
        setLoading(true);

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

            // Fetch packages via units → blocks → condominium
            const { data: packages } = await supabase
                .from('packages')
                .select('id, status, registered_at, carrier, recipient_name, volume_type, unit:units(number, block:blocks(name, condominium_id))')
                .order('registered_at', { ascending: false });

            // Filter to this condominium
            const condoPackages = (packages || []).filter(
                (p: any) => p.unit?.block?.condominium_id === condominium.id
            );

            const pending = condoPackages.filter((p: any) => p.status === 'pending');
            const todayPkgs = condoPackages.filter(
                (p: any) => new Date(p.registered_at) >= today
            );
            const overdue = pending.filter(
                (p: any) => new Date(p.registered_at) < threeDaysAgo
            );

            // Count residents and units
            const { count: residentCount } = await supabase
                .from('residents')
                .select('id', { count: 'exact', head: true })
                .in('unit_id', (
                    await supabase
                        .from('units')
                        .select('id')
                        .in('block_id', (
                            await supabase
                                .from('blocks')
                                .select('id')
                                .eq('condominium_id', condominium.id)
                        ).data?.map((b: any) => b.id) || [])
                ).data?.map((u: any) => u.id) || []);

            const { count: unitCount } = await supabase
                .from('units')
                .select('id', { count: 'exact', head: true })
                .in('block_id', (
                    await supabase
                        .from('blocks')
                        .select('id')
                        .eq('condominium_id', condominium.id)
                ).data?.map((b: any) => b.id) || []);

            setStats({
                totalPackages: condoPackages.length,
                pendingPackages: pending.length,
                todayPackages: todayPkgs.length,
                overduePackages: overdue.length,
                totalResidents: residentCount || 0,
                totalUnits: unitCount || 0,
            });

            setRecentPackages(condoPackages.slice(0, 10) as unknown as RecentPackage[]);
        } catch (err) {
            console.error('Error loading dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const volumeIcons: Record<string, string> = {
        box_s: '📦', box_m: '📦', box_l: '📦',
        envelope: '✉️', bag: '🛍️', tube: '📐', other: '📋',
    };

    if (loading) {
        return (
            <div className="page flex items-center justify-center" style={{ minHeight: '60vh' }}>
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">{condominium?.name || 'Visão geral do condomínio'}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid-stats mb-lg">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-warning-alpha)' }}>
                        <Clock size={22} color="var(--color-warning)" />
                    </div>
                    <div>
                        <div className="stat-value">{stats.pendingPackages}</div>
                        <div className="stat-label">Aguardando retirada</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-info-alpha)' }}>
                        <TrendingUp size={22} color="var(--color-info)" />
                    </div>
                    <div>
                        <div className="stat-value">{stats.todayPackages}</div>
                        <div className="stat-label">Recebidas hoje</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-danger-alpha)' }}>
                        <AlertTriangle size={22} color="var(--color-danger)" />
                    </div>
                    <div>
                        <div className="stat-value">{stats.overduePackages}</div>
                        <div className="stat-label">Atrasadas (3+ dias)</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-success-alpha)' }}>
                        <Package size={22} color="var(--color-success)" />
                    </div>
                    <div>
                        <div className="stat-value">{stats.totalPackages}</div>
                        <div className="stat-label">Total de encomendas</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-primary-alpha)' }}>
                        <Users size={22} color="var(--color-primary-light)" />
                    </div>
                    <div>
                        <div className="stat-value">{stats.totalResidents}</div>
                        <div className="stat-label">Moradores</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-accent)', opacity: 0.15 }}>
                        <CheckCircle size={22} color="var(--color-accent)" />
                    </div>
                    <div>
                        <div className="stat-value">{stats.totalUnits}</div>
                        <div className="stat-label">Unidades</div>
                    </div>
                </div>
            </div>

            {/* Recent Packages */}
            <div className="card">
                <div className="flex items-center justify-between mb-md">
                    <h2 className="text-lg font-semibold">Encomendas Recentes</h2>
                    <span className="text-sm text-muted">Últimas 10</span>
                </div>

                {recentPackages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <div className="empty-state-title">Nenhuma encomenda</div>
                        <div className="empty-state-text">As encomendas registradas aparecerão aqui</div>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Unidade</th>
                                    <th>Destinatário</th>
                                    <th>Transportadora</th>
                                    <th>Data</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPackages.map((pkg) => (
                                    <tr key={pkg.id}>
                                        <td>
                                            <span style={{ fontSize: 18 }}>
                                                {volumeIcons[pkg.volume_type] || '📦'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="font-medium text-primary">
                                                {pkg.unit?.block?.name} - {pkg.unit?.number}
                                            </span>
                                        </td>
                                        <td>{pkg.recipient_name || '—'}</td>
                                        <td>{pkg.carrier || '—'}</td>
                                        <td className="text-muted">{formatDate(pkg.registered_at)}</td>
                                        <td>
                                            <span className={`badge badge-${pkg.status === 'pending' ? 'pending' : pkg.status === 'picked_up' ? 'picked-up' : 'expired'}`}>
                                                {pkg.status === 'pending' ? '⏳ Pendente' : pkg.status === 'picked_up' ? '✅ Retirada' : '⚠️ Expirada'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
