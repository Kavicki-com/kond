import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Building2 } from 'lucide-react';

interface BlockWithUnits {
    id: string;
    name: string;
    sort_order: number;
    units: { id: string; number: string; sort_order: number }[];
}

export default function Units() {
    const { condominium } = useAuth();
    const [blocks, setBlocks] = useState<BlockWithUnits[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState('');
    const [newBlockName, setNewBlockName] = useState('');
    const [newUnitNumber, setNewUnitNumber] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (condominium) loadBlocks();
    }, [condominium]);

    const loadBlocks = async () => {
        if (!condominium) return;
        setLoading(true);
        const { data } = await supabase
            .from('blocks')
            .select('id, name, sort_order, units:units(id, number, sort_order)')
            .eq('condominium_id', condominium.id)
            .order('sort_order');

        // Sort units within each block
        const sorted = (data || []).map((b: any) => ({
            ...b,
            units: (b.units || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
        }));

        setBlocks(sorted);
        setLoading(false);
    };

    const handleAddBlock = async () => {
        if (!newBlockName.trim() || !condominium) return;
        setSaving(true);
        const { error } = await supabase.from('blocks').insert({
            condominium_id: condominium.id,
            name: newBlockName.trim(),
            sort_order: blocks.length,
        });
        setSaving(false);
        if (!error) {
            setNewBlockName('');
            setShowBlockModal(false);
            loadBlocks();
        }
    };

    const handleAddUnit = async () => {
        if (!newUnitNumber.trim() || !selectedBlockId) return;
        setSaving(true);
        const block = blocks.find((b) => b.id === selectedBlockId);
        const { error } = await supabase.from('units').insert({
            block_id: selectedBlockId,
            number: newUnitNumber.trim(),
            sort_order: block ? block.units.length : 0,
        });
        setSaving(false);
        if (!error) {
            setNewUnitNumber('');
            setShowUnitModal(false);
            loadBlocks();
        }
    };

    const handleDeleteBlock = async (blockId: string) => {
        if (!confirm('Excluir este bloco e todas as suas unidades?')) return;
        await supabase.from('blocks').delete().eq('id', blockId);
        loadBlocks();
    };

    const handleDeleteUnit = async (unitId: string) => {
        if (!confirm('Excluir esta unidade?')) return;
        await supabase.from('units').delete().eq('id', unitId);
        loadBlocks();
    };

    const totalUnits = blocks.reduce((sum, b) => sum + b.units.length, 0);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Unidades</h1>
                    <p className="page-subtitle">{blocks.length} blocos · {totalUnits} unidades</p>
                </div>
                <div className="flex gap-sm">
                    <button className="btn btn-secondary" onClick={() => setShowBlockModal(true)}>
                        <Building2 size={16} /> Novo Bloco
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowUnitModal(true)} disabled={blocks.length === 0}>
                        <Plus size={16} /> Nova Unidade
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
                    <div className="spinner spinner-lg" />
                </div>
            ) : blocks.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🏢</div>
                    <div className="empty-state-title">Nenhum bloco cadastrado</div>
                    <div className="empty-state-text">Comece criando blocos e unidades no seu condomínio</div>
                    <button className="btn btn-primary mt-md" onClick={() => setShowBlockModal(true)}>
                        <Plus size={16} /> Criar Bloco
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-lg">
                    {blocks.map((block) => (
                        <div key={block.id} className="card">
                            <div className="flex items-center justify-between mb-md">
                                <div className="flex items-center gap-sm">
                                    <Building2 size={20} color="var(--color-primary-light)" />
                                    <h3 className="text-lg font-semibold">{block.name}</h3>
                                    <span className="badge badge-info">{block.units.length} unidades</span>
                                </div>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => handleDeleteBlock(block.id)}
                                    title="Excluir bloco"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {block.units.length === 0 ? (
                                <p className="text-sm text-muted" style={{ padding: 'var(--space-md) 0' }}>
                                    Nenhuma unidade neste bloco
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-sm">
                                    {block.units.map((unit) => (
                                        <div
                                            key={unit.id}
                                            className="flex items-center gap-xs"
                                            style={{
                                                background: 'var(--color-surface-light)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: '8px 14px',
                                                border: '1px solid var(--color-border)',
                                            }}
                                        >
                                            <span className="text-sm font-medium">{unit.number}</span>
                                            <button
                                                onClick={() => handleDeleteUnit(unit.id)}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    color: 'var(--color-text-muted)', padding: 2,
                                                }}
                                                title="Excluir unidade"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                className="btn btn-ghost btn-sm mt-md"
                                onClick={() => {
                                    setSelectedBlockId(block.id);
                                    setShowUnitModal(true);
                                }}
                            >
                                <Plus size={14} /> Adicionar unidade
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Block Modal */}
            {showBlockModal && (
                <div className="modal-overlay" onClick={() => setShowBlockModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Novo Bloco</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowBlockModal(false)}>✕</button>
                        </div>
                        <div className="form-group">
                            <label className="input-label">Nome do bloco</label>
                            <input
                                className="input"
                                placeholder="Ex: Bloco A, Torre 1"
                                value={newBlockName}
                                onChange={(e) => setNewBlockName(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleAddBlock()}
                            />
                        </div>
                        <div className="flex justify-end gap-sm mt-lg">
                            <button className="btn btn-secondary" onClick={() => setShowBlockModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleAddBlock} disabled={saving || !newBlockName.trim()}>
                                {saving ? <div className="spinner" /> : 'Criar Bloco'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Unit Modal */}
            {showUnitModal && (
                <div className="modal-overlay" onClick={() => setShowUnitModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nova Unidade</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowUnitModal(false)}>✕</button>
                        </div>
                        <div className="flex flex-col gap-md">
                            <div className="form-group">
                                <label className="input-label">Bloco</label>
                                <select
                                    className="select"
                                    value={selectedBlockId}
                                    onChange={(e) => setSelectedBlockId(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {blocks.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="input-label">Número da unidade</label>
                                <input
                                    className="input"
                                    placeholder="Ex: 101, 202"
                                    value={newUnitNumber}
                                    onChange={(e) => setNewUnitNumber(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddUnit()}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-sm mt-lg">
                            <button className="btn btn-secondary" onClick={() => setShowUnitModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleAddUnit} disabled={saving || !newUnitNumber.trim() || !selectedBlockId}>
                                {saving ? <div className="spinner" /> : 'Criar Unidade'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
