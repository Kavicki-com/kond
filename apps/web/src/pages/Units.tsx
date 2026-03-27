import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Building2, Pencil } from 'lucide-react';

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

    // Block modal state
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockQty, setBlockQty] = useState('1');
    const [blockPrefix, setBlockPrefix] = useState('Bloco ');
    const [blockFloors, setBlockFloors] = useState('');
    const [unitsPerFloor, setUnitsPerFloor] = useState('4');
    const [savingBlock, setSavingBlock] = useState(false);

    // Unit modal state
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState('');
    const [unitNumbers, setUnitNumbers] = useState('');
    const [savingUnit, setSavingUnit] = useState(false);
    const [unitPreview, setUnitPreview] = useState<string[]>([]);

    // Edit block state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBlockId, setEditingBlockId] = useState('');
    const [editingBlockName, setEditingBlockName] = useState('');
    const [updatingBlock, setUpdatingBlock] = useState(false);

    useEffect(() => {
        if (condominium) loadBlocks();
    }, [condominium]);

    // Update preview as user types unit numbers
    useEffect(() => {
        const parsed = unitNumbers
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        setUnitPreview(parsed);
    }, [unitNumbers]);

    const loadBlocks = async () => {
        if (!condominium) return;
        setLoading(true);
        const { data } = await supabase
            .from('blocks')
            .select('id, name, sort_order, units:units(id, number, sort_order)')
            .eq('condominium_id', condominium.id)
            .order('sort_order');

        const sorted = (data || []).map((b: any) => ({
            ...b,
            units: (b.units || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
        }));

        setBlocks(sorted);
        setLoading(false);
    };

    // Generate block names: "Bloco A", "Bloco B" or "Bloco 1", "Bloco 2"
    const generateBlockNames = (): string[] => {
        const qty = parseInt(blockQty) || 1;
        const prefix = blockPrefix.trimEnd();
        const names: string[] = [];

        for (let i = 0; i < qty; i++) {
            // If prefix ends with a space or letter, use alphabet; otherwise use numbers
            const suffix = qty <= 26
                ? String.fromCharCode(65 + i) // A, B, C...
                : String(i + 1);              // 1, 2, 3...
            names.push(`${prefix} ${suffix}`.trim());
        }
        return names;
    };

    // Generate floor-based unit numbers for a block
    const generateFloorUnits = (): string[] => {
        const floors = parseInt(blockFloors) || 0;
        const perFloor = parseInt(unitsPerFloor) || 4;
        if (floors === 0) return [];
        const units: string[] = [];
        for (let floor = 1; floor <= floors; floor++) {
            const floorStr = String(floor).padStart(2, '0');
            for (let apt = 1; apt <= perFloor; apt++) {
                units.push(`${floorStr}${String(apt).padStart(2, '0')}`);
            }
        }
        return units;
    };

    const handleAddBlocks = async () => {
        if (!condominium) return;
        setSavingBlock(true);

        const names = generateBlockNames();
        const baseOrder = blocks.length;

        for (let i = 0; i < names.length; i++) {
            const { data: blockData, error: blockError } = await supabase
                .from('blocks')
                .insert({
                    condominium_id: condominium.id,
                    name: names[i],
                    sort_order: baseOrder + i,
                })
                .select('id')
                .single();

            if (blockError || !blockData) continue;

            // If floors specified, auto-generate units
            if (blockFloors && parseInt(blockFloors) > 0) {
                const unitList = generateFloorUnits();
                const unitInserts = unitList.map((num, idx) => ({
                    block_id: blockData.id,
                    number: num,
                    sort_order: idx,
                }));
                await supabase.from('units').insert(unitInserts);
            }
        }

        setSavingBlock(false);
        setBlockQty('1');
        setBlockPrefix('Bloco ');
        setBlockFloors('');
        setShowBlockModal(false);
        loadBlocks();
    };

    const handleAddUnits = async () => {
        if (!selectedBlockId || unitPreview.length === 0) return;
        setSavingUnit(true);

        const block = blocks.find(b => b.id === selectedBlockId);
        const baseOrder = block ? block.units.length : 0;

        const inserts = unitPreview.map((num, idx) => ({
            block_id: selectedBlockId,
            number: num,
            sort_order: baseOrder + idx,
        }));

        await supabase.from('units').insert(inserts);

        setSavingUnit(false);
        setUnitNumbers('');
        setSelectedBlockId('');
        setShowUnitModal(false);
        loadBlocks();
    };

    const handleDeleteBlock = async (blockId: string) => {
        if (!confirm('Excluir este bloco e todas as suas unidades?')) return;
        await supabase.from('blocks').delete().eq('id', blockId);
        loadBlocks();
    };

    const handleUpdateBlock = async () => {
        if (!editingBlockId || !editingBlockName.trim()) return;
        setUpdatingBlock(true);

        const { error } = await supabase
            .from('blocks')
            .update({ name: editingBlockName.trim() })
            .eq('id', editingBlockId);

        if (!error) {
            setShowEditModal(false);
            setEditingBlockId('');
            setEditingBlockName('');
            loadBlocks();
        }
        setUpdatingBlock(false);
    };

    const handleDeleteUnit = async (unitId: string) => {
        if (!confirm('Excluir esta unidade?')) return;
        await supabase.from('units').delete().eq('id', unitId);
        loadBlocks();
    };

    const totalUnits = blocks.reduce((sum, b) => sum + b.units.length, 0);

    // Block name preview
    const blockNamePreview = generateBlockNames();

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
                    <button className="btn btn-primary" onClick={() => { setShowUnitModal(true); setSelectedBlockId(''); setUnitNumbers(''); }} disabled={blocks.length === 0}>
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
                                    <button
                                        className="btn btn-ghost btn-xs text-muted"
                                        onClick={() => {
                                            setEditingBlockId(block.id);
                                            setEditingBlockName(block.name);
                                            setShowEditModal(true);
                                        }}
                                        title="Editar nome"
                                        style={{ padding: 4, display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Pencil size={12} />
                                        <span className="text-xs">Editar</span>
                                    </button>
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
                                    setUnitNumbers('');
                                    setShowUnitModal(true);
                                }}
                            >
                                <Plus size={14} /> Adicionar unidades
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Novo Bloco Modal ── */}
            {showBlockModal && (
                <div className="modal-overlay" onClick={() => setShowBlockModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Novo Bloco</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowBlockModal(false)}>✕</button>
                        </div>

                        <div className="flex flex-col gap-md">
                            <div className="flex gap-md" style={{ alignItems: 'flex-end' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="input-label">Quantidade de blocos</label>
                                    <input
                                        className="input"
                                        type="number"
                                        min="1"
                                        max="50"
                                        placeholder="Ex: 3"
                                        value={blockQty}
                                        onChange={e => setBlockQty(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 2 }}>
                                    <label className="input-label">Prefixo do nome</label>
                                    <input
                                        className="input"
                                        placeholder="Ex: Bloco, Torre, Setor"
                                        value={blockPrefix}
                                        onChange={e => setBlockPrefix(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-md" style={{ alignItems: 'flex-end' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="input-label">
                                        Andares <span className="text-muted" style={{ fontWeight: 400 }}>(opcional)</span>
                                    </label>
                                    <input
                                        className="input"
                                        type="number"
                                        min="0"
                                        placeholder="Ex: 10"
                                        value={blockFloors}
                                        onChange={e => setBlockFloors(e.target.value)}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="input-label">Unidades por andar</label>
                                    <input
                                        className="input"
                                        type="number"
                                        min="1"
                                        max="20"
                                        placeholder="Ex: 4"
                                        value={unitsPerFloor}
                                        onChange={e => setUnitsPerFloor(e.target.value)}
                                        disabled={!blockFloors || parseInt(blockFloors) === 0}
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            {blockNamePreview.length > 0 && (
                                <div style={{
                                    background: 'var(--color-surface-light)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '12px 16px',
                                    border: '1px solid var(--color-border)',
                                }}>
                                    <p className="text-xs text-muted mb-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prévia</p>
                                    <div className="flex flex-wrap gap-xs">
                                        {blockNamePreview.slice(0, 10).map((name, i) => (
                                            <span key={i} className="badge badge-info">{name}</span>
                                        ))}
                                        {blockNamePreview.length > 10 && (
                                            <span className="text-xs text-muted">+{blockNamePreview.length - 10} mais</span>
                                        )}
                                    </div>
                                    {blockFloors && parseInt(blockFloors) > 0 && (
                                        <p className="text-xs text-muted mt-xs">
                                            + {parseInt(blockFloors) * (parseInt(unitsPerFloor) || 4)} unidades por bloco (andares 01–{blockFloors.padStart(2, '0')}, {unitsPerFloor || '4'} aptos/andar)
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-sm mt-lg">
                            <button className="btn btn-secondary" onClick={() => setShowBlockModal(false)}>Cancelar</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleAddBlocks}
                                disabled={savingBlock || !blockPrefix.trim() || !blockQty || parseInt(blockQty) < 1}
                            >
                                {savingBlock ? <div className="spinner" /> : `Criar ${parseInt(blockQty) > 1 ? `${blockQty} Blocos` : 'Bloco'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Nova Unidade Modal ── */}
            {showUnitModal && (
                <div className="modal-overlay" onClick={() => setShowUnitModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Adicionar Unidades</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowUnitModal(false)}>✕</button>
                        </div>

                        <div className="flex flex-col gap-md">
                            <div className="form-group">
                                <label className="input-label">Bloco</label>
                                <select
                                    className="select"
                                    value={selectedBlockId}
                                    onChange={e => setSelectedBlockId(e.target.value)}
                                >
                                    <option value="">Selecione o bloco...</option>
                                    {blocks.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="input-label">
                                    Números das unidades
                                    <span className="text-muted" style={{ fontWeight: 400 }}> — separe por vírgula</span>
                                </label>
                                <input
                                    className="input"
                                    placeholder="Ex: 101, 102, 103, 201, 202"
                                    value={unitNumbers}
                                    onChange={e => setUnitNumbers(e.target.value)}
                                    autoFocus={!selectedBlockId}
                                />
                            </div>

                            {/* Preview chips */}
                            {unitPreview.length > 0 && (
                                <div style={{
                                    background: 'var(--color-surface-light)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '12px 16px',
                                    border: '1px solid var(--color-border)',
                                }}>
                                    <p className="text-xs text-muted mb-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {unitPreview.length} unidade{unitPreview.length !== 1 ? 's' : ''} para criar
                                    </p>
                                    <div className="flex flex-wrap gap-xs">
                                        {unitPreview.slice(0, 20).map((num, i) => (
                                            <span key={i} className="badge badge-info">{num}</span>
                                        ))}
                                        {unitPreview.length > 20 && (
                                            <span className="text-xs text-muted">+{unitPreview.length - 20} mais</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-sm mt-lg">
                            <button className="btn btn-secondary" onClick={() => setShowUnitModal(false)}>Cancelar</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleAddUnits}
                                disabled={savingUnit || !selectedBlockId || unitPreview.length === 0}
                            >
                                {savingUnit ? <div className="spinner" /> : `Criar ${unitPreview.length > 0 ? unitPreview.length : ''} Unidade${unitPreview.length !== 1 ? 's' : ''}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Editar Bloco Modal ── */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Editar Bloco</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)}>✕</button>
                        </div>

                        <div className="form-group">
                            <label className="input-label">Nome do bloco</label>
                            <input
                                className="input"
                                value={editingBlockName}
                                onChange={e => setEditingBlockName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end gap-sm mt-lg">
                            <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleUpdateBlock}
                                disabled={updatingBlock || !editingBlockName.trim()}
                            >
                                {updatingBlock ? <div className="spinner" /> : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
