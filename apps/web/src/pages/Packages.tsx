import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Search, Filter } from 'lucide-react';

interface PackageRow {
    id: string;
    carrier: string | null;
    recipient_name: string | null;
    status: string;
    volume_type: string;
    tracking_code: string | null;
    notes: string | null;
    registered_at: string;
    picked_up_at: string | null;
    unit: { number: string; block: { name: string; condominium_id: string } };
}

const volumeLabels: Record<string, string> = {
    box_s: 'Caixa P', box_m: 'Caixa M', box_l: 'Caixa G',
    envelope: 'Envelope', bag: 'Sacola', tube: 'Tubo', other: 'Outro',
};

export default function Packages() {
    const { condominium } = useAuth();
    const [packages, setPackages] = useState<PackageRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        if (condominium) loadPackages();
    }, [condominium]);

    const loadPackages = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('packages')
            .select('*, unit:units(number, block:blocks(name, condominium_id))')
            .order('registered_at', { ascending: false });

        const filtered = (data || []).filter(
            (p: any) => p.unit?.block?.condominium_id === condominium?.id
        );
        setPackages(filtered as PackageRow[]);
        setLoading(false);
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });

    const filteredPackages = packages.filter((p) => {
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchesSearch =
            !search ||
            p.carrier?.toLowerCase().includes(search.toLowerCase()) ||
            p.recipient_name?.toLowerCase().includes(search.toLowerCase()) ||
            p.tracking_code?.toLowerCase().includes(search.toLowerCase()) ||
            p.unit?.number?.includes(search) ||
            p.unit?.block?.name?.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Encomendas</h1>
                    <p className="page-subtitle">{packages.length} encomendas registradas</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-md mb-lg" style={{ flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        className="input"
                        style={{ paddingLeft: 36 }}
                        placeholder="Buscar por unidade, destinatário, transportadora..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-sm items-center">
                    <Filter size={16} color="var(--color-text-muted)" />
                    <select className="select" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">Todos</option>
                        <option value="pending">Pendentes</option>
                        <option value="picked_up">Retiradas</option>
                        <option value="expired">Expiradas</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
                    <div className="spinner spinner-lg" />
                </div>
            ) : filteredPackages.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <div className="empty-state-title">Nenhuma encomenda encontrada</div>
                    <div className="empty-state-text">Tente alterar os filtros de busca</div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Unidade</th>
                                <th>Destinatário</th>
                                <th>Transportadora</th>
                                <th>Tipo</th>
                                <th>Rastreio</th>
                                <th>Registrada em</th>
                                <th>Retirada em</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPackages.map((pkg) => (
                                <tr key={pkg.id}>
                                    <td className="font-medium text-primary">
                                        {pkg.unit?.block?.name} - {pkg.unit?.number}
                                    </td>
                                    <td>{pkg.recipient_name || '—'}</td>
                                    <td>{pkg.carrier || '—'}</td>
                                    <td>{volumeLabels[pkg.volume_type] || pkg.volume_type}</td>
                                    <td className="text-muted" style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}>
                                        {pkg.tracking_code || '—'}
                                    </td>
                                    <td className="text-muted">{formatDate(pkg.registered_at)}</td>
                                    <td className="text-muted">{pkg.picked_up_at ? formatDate(pkg.picked_up_at) : '—'}</td>
                                    <td>
                                        <span className={`badge badge-${pkg.status === 'pending' ? 'pending' : pkg.status === 'picked_up' ? 'picked-up' : 'expired'}`}>
                                            {pkg.status === 'pending' ? 'Pendente' : pkg.status === 'picked_up' ? 'Retirada' : 'Expirada'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
