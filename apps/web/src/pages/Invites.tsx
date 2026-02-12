import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Copy, Trash2 } from 'lucide-react';

interface InviteRow {
    id: string;
    code: string;
    role: string;
    email: string | null;
    used_by: string | null;
    used_at: string | null;
    expires_at: string;
    created_at: string;
    unit_id: string | null;
    unit?: { number: string; block: { name: string } } | null;
}

interface BlockOption {
    id: string;
    name: string;
    units: { id: string; number: string }[];
}

export default function Invites() {
    const { condominium } = useAuth();
    const [invites, setInvites] = useState<InviteRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [inviteRole, setInviteRole] = useState<string>('resident');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteUnitId, setInviteUnitId] = useState('');
    const [blocks, setBlocks] = useState<BlockOption[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (condominium) {
            loadInvites();
            loadBlocks();
        }
    }, [condominium]);

    const loadInvites = async () => {
        if (!condominium) return;
        setLoading(true);
        const { data } = await supabase
            .from('invites')
            .select('*, unit:units(number, block:blocks(name))')
            .eq('condominium_id', condominium.id)
            .order('created_at', { ascending: false });
        setInvites((data || []) as InviteRow[]);
        setLoading(false);
    };

    const loadBlocks = async () => {
        if (!condominium) return;
        const { data } = await supabase
            .from('blocks')
            .select('id, name, units:units(id, number)')
            .eq('condominium_id', condominium.id)
            .order('sort_order');
        setBlocks((data || []) as BlockOption[]);
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
        return code;
    };

    const handleCreate = async () => {
        if (!condominium) return;
        if (inviteRole === 'resident' && !inviteUnitId) {
            alert('Selecione a unidade para convites de moradores.');
            return;
        }

        setSaving(true);
        const code = generateCode();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const { error } = await supabase.from('invites').insert({
            condominium_id: condominium.id,
            code,
            role: inviteRole,
            email: inviteEmail.trim() || null,
            unit_id: inviteRole === 'resident' ? inviteUnitId : null,
            expires_at: expiresAt.toISOString(),
        });

        setSaving(false);
        if (!error) {
            setShowModal(false);
            setInviteEmail('');
            setInviteUnitId('');
            setInviteRole('resident');
            loadInvites();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este convite?')) return;
        await supabase.from('invites').delete().eq('id', id);
        setInvites((prev) => prev.filter((i) => i.id !== id));
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(''), 2000);
    };

    const isExpired = (d: string) => new Date(d) < new Date();

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

    const roleLabels: Record<string, string> = {
        resident: 'Morador',
        doorman: 'Porteiro',
        janitor: 'Zelador',
        admin: 'Administrador',
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Convites</h1>
                    <p className="page-subtitle">Gere códigos de convite para moradores e funcionários</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> Novo Convite
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
                    <div className="spinner spinner-lg" />
                </div>
            ) : invites.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📧</div>
                    <div className="empty-state-title">Nenhum convite</div>
                    <div className="empty-state-text">Gere um código de convite para adicionar usuários</div>
                    <button className="btn btn-primary mt-md" onClick={() => setShowModal(true)}>
                        <Plus size={16} /> Criar Convite
                    </button>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Perfil</th>
                                <th>Unidade</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Expira em</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invites.map((inv) => (
                                <tr key={inv.id}>
                                    <td>
                                        <div className="flex items-center gap-sm">
                                            <code style={{
                                                fontFamily: 'monospace', fontSize: 'var(--font-md)',
                                                fontWeight: 700, letterSpacing: 2,
                                                color: 'var(--color-primary-light)',
                                            }}>
                                                {inv.code}
                                            </code>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => copyCode(inv.code)}
                                                title="Copiar código"
                                            >
                                                {copied === inv.code ? '✓' : <Copy size={12} />}
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${inv.role === 'admin' ? 'badge-admin' : inv.role === 'resident' ? 'badge-info' : 'badge-active'}`}>
                                            {roleLabels[inv.role] || inv.role}
                                        </span>
                                    </td>
                                    <td>
                                        {inv.unit ? `${inv.unit.block?.name} - ${inv.unit.number}` : '—'}
                                    </td>
                                    <td className="text-muted">{inv.email || '—'}</td>
                                    <td>
                                        {inv.used_by ? (
                                            <span className="badge badge-picked-up">Usado</span>
                                        ) : isExpired(inv.expires_at) ? (
                                            <span className="badge badge-expired">Expirado</span>
                                        ) : (
                                            <span className="badge badge-pending">Pendente</span>
                                        )}
                                    </td>
                                    <td className="text-muted">{formatDate(inv.expires_at)}</td>
                                    <td>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(inv.id)} title="Excluir">
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Invite Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Novo Convite</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <div className="flex flex-col gap-md">
                            <div className="form-group">
                                <label className="input-label">Perfil</label>
                                <select className="select" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                                    <option value="resident">Morador</option>
                                    <option value="doorman">Porteiro</option>
                                    <option value="janitor">Zelador</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            {inviteRole === 'resident' && (
                                <div className="form-group">
                                    <label className="input-label">Unidade</label>
                                    <select
                                        className="select"
                                        value={inviteUnitId}
                                        onChange={(e) => setInviteUnitId(e.target.value)}
                                    >
                                        <option value="">Selecione a unidade...</option>
                                        {blocks.map((b) =>
                                            b.units.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {b.name} - {u.number}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="input-label">Email (opcional)</label>
                                <input
                                    className="input"
                                    type="email"
                                    placeholder="usuario@email.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-sm mt-lg">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                                {saving ? <div className="spinner" /> : 'Gerar Convite'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
