import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Search, Trash2 } from 'lucide-react';

interface ResidentRow {
    id: string;
    is_primary: boolean;
    receives_notifications: boolean;
    created_at: string;
    profile: { id: string; full_name: string | null; phone: string | null; email?: string };
    unit: { number: string; block: { name: string; condominium_id: string } };
}

export default function Residents() {
    const { condominium } = useAuth();
    const [residents, setResidents] = useState<ResidentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (condominium) loadResidents();
    }, [condominium]);

    const loadResidents = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('residents')
            .select('*, profile:profiles(id, full_name, phone), unit:units(number, block:blocks(name, condominium_id))')
            .order('created_at', { ascending: false });

        const filtered = (data || []).filter(
            (r: any) => r.unit?.block?.condominium_id === condominium?.id
        );
        setResidents(filtered as ResidentRow[]);
        setLoading(false);
    };

    const handleRemove = async (id: string) => {
        if (!confirm('Remover este morador?')) return;
        await supabase.from('residents').delete().eq('id', id);
        setResidents((prev) => prev.filter((r) => r.id !== id));
    };

    const filteredResidents = residents.filter((r) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            r.profile?.full_name?.toLowerCase().includes(s) ||
            r.profile?.phone?.includes(s) ||
            r.unit?.number?.includes(s) ||
            r.unit?.block?.name?.toLowerCase().includes(s)
        );
    });

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('pt-BR');

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Moradores</h1>
                    <p className="page-subtitle">{residents.length} moradores cadastrados</p>
                </div>
            </div>

            <div className="flex gap-md mb-lg" style={{ flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        className="input"
                        style={{ paddingLeft: 36 }}
                        placeholder="Buscar por nome, telefone, unidade..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
                    <div className="spinner spinner-lg" />
                </div>
            ) : filteredResidents.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👤</div>
                    <div className="empty-state-title">Nenhum morador encontrado</div>
                    <div className="empty-state-text">Envie convites para adicionar moradores</div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Telefone</th>
                                <th>Unidade</th>
                                <th>Principal</th>
                                <th>Notificações</th>
                                <th>Cadastro</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResidents.map((r) => (
                                <tr key={r.id}>
                                    <td className="font-medium text-primary">{r.profile?.full_name || '—'}</td>
                                    <td className="text-muted">{r.profile?.phone || '—'}</td>
                                    <td>
                                        <span className="badge badge-info">
                                            {r.unit?.block?.name} - {r.unit?.number}
                                        </span>
                                    </td>
                                    <td>{r.is_primary ? <span className="badge badge-active">Sim</span> : '—'}</td>
                                    <td>{r.receives_notifications ? '🔔' : '🔕'}</td>
                                    <td className="text-muted">{formatDate(r.created_at)}</td>
                                    <td>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(r.id)} title="Remover">
                                            <Trash2 size={14} />
                                        </button>
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
