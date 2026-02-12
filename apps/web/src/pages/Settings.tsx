import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Save, Building2, User } from 'lucide-react';

export default function Settings() {
    const { condominium, profile, refreshUserData } = useAuth();
    const [condoName, setCondoName] = useState(condominium?.name || '');
    const [condoAddress, setCondoAddress] = useState(condominium?.address || '');
    const [condoCnpj, setCondoCnpj] = useState(condominium?.cnpj || '');
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSaveCondo = async () => {
        if (!condominium) return;
        setSaving(true);
        const { error } = await supabase
            .from('condominiums')
            .update({
                name: condoName.trim(),
                address: condoAddress.trim() || null,
                cnpj: condoCnpj.trim() || null,
            })
            .eq('id', condominium.id);

        if (!error) {
            setMessage('Dados do condomínio salvos!');
            await refreshUserData();
        } else {
            setMessage('Erro ao salvar: ' + error.message);
        }
        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleSaveProfile = async () => {
        if (!profile) return;
        setSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName.trim(),
                phone: phone.trim() || null,
            })
            .eq('id', profile.id);

        if (!error) {
            setMessage('Perfil salvo!');
            await refreshUserData();
        } else {
            setMessage('Erro ao salvar: ' + error.message);
        }
        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Configurações</h1>
                    <p className="page-subtitle">Gerencie as informações do condomínio e perfil</p>
                </div>
            </div>

            {message && (
                <div
                    style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-lg)',
                        background: message.includes('Erro') ? 'var(--color-danger-alpha)' : 'var(--color-success-alpha)',
                        color: message.includes('Erro') ? 'var(--color-danger)' : 'var(--color-success)',
                        fontSize: 'var(--font-sm)',
                        fontWeight: 500,
                    }}
                >
                    {message}
                </div>
            )}

            <div className="flex flex-col gap-xl">
                {/* Condominium Settings */}
                <div className="card">
                    <div className="flex items-center gap-sm mb-lg">
                        <Building2 size={20} color="var(--color-primary-light)" />
                        <h2 className="text-lg font-semibold">Dados do Condomínio</h2>
                    </div>

                    <div className="flex flex-col gap-md" style={{ maxWidth: 500 }}>
                        <div className="form-group">
                            <label className="input-label">Nome</label>
                            <input
                                className="input"
                                value={condoName}
                                onChange={(e) => setCondoName(e.target.value)}
                                placeholder="Nome do condomínio"
                            />
                        </div>
                        <div className="form-group">
                            <label className="input-label">Endereço</label>
                            <input
                                className="input"
                                value={condoAddress}
                                onChange={(e) => setCondoAddress(e.target.value)}
                                placeholder="Rua, número, cidade"
                            />
                        </div>
                        <div className="form-group">
                            <label className="input-label">CNPJ</label>
                            <input
                                className="input"
                                value={condoCnpj}
                                onChange={(e) => setCondoCnpj(e.target.value)}
                                placeholder="XX.XXX.XXX/XXXX-XX"
                            />
                        </div>
                        <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleSaveCondo} disabled={saving}>
                            <Save size={16} /> Salvar
                        </button>
                    </div>
                </div>

                {/* Profile Settings */}
                <div className="card">
                    <div className="flex items-center gap-sm mb-lg">
                        <User size={20} color="var(--color-accent)" />
                        <h2 className="text-lg font-semibold">Meu Perfil</h2>
                    </div>

                    <div className="flex flex-col gap-md" style={{ maxWidth: 500 }}>
                        <div className="form-group">
                            <label className="input-label">Nome completo</label>
                            <input
                                className="input"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Seu nome"
                            />
                        </div>
                        <div className="form-group">
                            <label className="input-label">Telefone</label>
                            <input
                                className="input"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="(XX) XXXXX-XXXX"
                            />
                        </div>
                        <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleSaveProfile} disabled={saving}>
                            <Save size={16} /> Salvar
                        </button>
                    </div>
                </div>

                {/* Plan Info */}
                <div className="card">
                    <div className="flex items-center gap-sm mb-md">
                        <span style={{ fontSize: 20 }}>💎</span>
                        <h2 className="text-lg font-semibold">Plano Atual</h2>
                    </div>
                    <div className="flex items-center gap-md">
                        <span className="badge badge-admin" style={{ fontSize: 'var(--font-md)', padding: '6px 16px' }}>
                            {condominium?.plan?.toUpperCase() || 'FREE'}
                        </span>
                        <span className="text-sm text-muted">
                            {condominium?.unit_limit ? `Até ${condominium.unit_limit} unidades` : 'Unidades ilimitadas'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
