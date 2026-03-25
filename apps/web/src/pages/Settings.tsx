import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Save, Building2, User, Lock, CreditCard, AlertTriangle, MapPin } from 'lucide-react';

export default function Settings() {
    const { user, condominium, profile, refreshUserData } = useAuth();
    
    // Condominium Details
    const [condoName, setCondoName] = useState(condominium?.name || '');
    const [condoCnpj, setCondoCnpj] = useState(condominium?.cnpj || '');
    const [units, setUnits] = useState(condominium?.unit_limit?.toString() || '');
    
    // Address (ViaCEP)
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [isFetchingCep, setIsFetchingCep] = useState(false);

    // Profile Details
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [cpf, setCpf] = useState((profile as any)?.cpf || '');
    
    // Security
    const [currentPassword, setCurrentPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        
        setCep(value);
        
        const plainCep = value.replace(/\D/g, '');
        if (plainCep.length === 8) {
            setIsFetchingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${plainCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setLogradouro(data.logradouro || '');
                    setBairro(data.bairro || '');
                    setCidade(data.localidade || '');
                    setEstado(data.uf || '');
                    setTimeout(() => document.getElementById('setting-numero')?.focus(), 100);
                }
            } catch (err) {
                console.error('Erro ao buscar CEP:', err);
            } finally {
                setIsFetchingCep(false);
            }
        }
    };

    const handleSaveCondo = async () => {
        if (!condominium) return;
        setSaving(true);
        
        let finalAddress = condominium.address;
        if (showNewAddressForm && cep && logradouro && numero) {
            finalAddress = `${logradouro}, ${numero}${complemento ? ' - ' + complemento : ''} - ${bairro}, ${cidade} - ${estado}, CEP: ${cep}`;
        }

        const updatePayload: any = {
            name: condoName.trim(),
            address: finalAddress || null,
            cnpj: condoCnpj.trim() || null,
        };

        if (units) {
            updatePayload.unit_limit = parseInt(units);
        }

        const { error } = await supabase
            .from('condominiums')
            .update(updatePayload)
            .eq('id', condominium.id);

        if (!error) {
            setMessage('Dados do condomínio salvos!');
            setShowNewAddressForm(false);
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
                cpf: cpf.trim() || null,
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

    const handleSaveSecurity = async () => {
        if (!currentPassword) {
            setMessage('Erro: A senha atual é obrigatória para fazer alterações de segurança.');
            setTimeout(() => setMessage(''), 4000);
            return;
        }

        setSaving(true);
        
        // 1. Verify current password by signing in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user?.email || '',
            password: currentPassword
        });

        if (signInError) {
            setMessage('Erro: A senha atual informada está incorreta.');
            setSaving(false);
            setTimeout(() => setMessage(''), 4000);
            return;
        }

        let errorMsg = '';
        let hasChanges = false;
        
        // 2. Process changes since auth is verified recent
        if (newPassword) {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) errorMsg += error.message + ' ';
            else hasChanges = true;
        }

        if (newEmail && newEmail !== user?.email) {
            const { error } = await supabase.auth.updateUser({ email: newEmail });
            if (error) errorMsg += error.message + ' ';
            else hasChanges = true;
        }

        if (errorMsg) {
            setMessage('Erro na segurança: ' + errorMsg);
        } else if (hasChanges) {
            setMessage('Configurações de segurança atualizadas! Se alterou o email, confirme na sua caixa de entrada.');
            setNewPassword('');
            setNewEmail('');
            setCurrentPassword(''); // clear sensitive
        } else {
            setMessage('Nenhuma nova alteração solicitada (Email ou Senha em branco).');
        }
        
        setSaving(false);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleChangePlan = async (newPlan: 'pro' | 'basic') => {
        if (!condominium) return;
        if (!window.confirm(`Confirma a alteração para o plano ${newPlan.toUpperCase()}?`)) return;
        setSaving(true);
        const { error } = await supabase
            .from('condominiums')
            .update({ plan: newPlan })
            .eq('id', condominium.id);

        if (!error) {
            setMessage(`Plano alterado para ${newPlan.toUpperCase()}!`);
            await refreshUserData();
        } else {
            setMessage('Erro ao alterar plano: ' + error.message);
        }
        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleCancelPlan = async () => {
        if (!condominium) return;
        if (!window.confirm('Tem certeza absoluta que deseja cancelar a assinatura? Esta ação não poderá ser desfeita.')) return;
        
        setSaving(true);
        const { error } = await supabase
            .from('condominiums')
            .update({ status: 'cancelled' })
            .eq('id', condominium.id);

        if (!error) {
            setMessage('Assinatura cancelada com sucesso.');
            await refreshUserData();
        } else {
            setMessage('Erro ao cancelar: ' + error.message);
        }
        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Configurações</h1>
                    <p className="page-subtitle">Gerencie as informações do condomínio, perfil e assinatura</p>
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

                    <div className="flex flex-col gap-lg">
                        <div className="grid-cols-2 gap-md" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
                            <div className="form-group">
                                <label className="input-label">Nome do Condomínio</label>
                                <input
                                    className="input"
                                    value={condoName}
                                    onChange={(e) => setCondoName(e.target.value)}
                                    placeholder="Ex: Condomínio Solar"
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
                        </div>
                        
                        <div className="grid-cols-2 gap-md" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
                            <div className="form-group">
                                <label className="input-label">Quantidade de Unidades (Aprox.)</label>
                                <input
                                    className="input"
                                    type="number"
                                    value={units}
                                    onChange={(e) => setUnits(e.target.value)}
                                    placeholder="Total de apartamentos / casas"
                                />
                            </div>
                            <div></div>
                        </div>

                        {/* Endereço Antigo / Novo via CEP */}
                        <div className="bg-surface-light p-md rounded-md border border-border">
                            <div className="flex items-center gap-sm mb-xs">
                                <MapPin size={16} color="var(--color-text-secondary)" />
                                <label className="input-label mb-0">Endereço Atual</label>
                            </div>
                            <p className="text-sm text-secondary mb-md mt-xs">
                                {condominium?.address || 'Nenhum endereço cadastrado'}
                            </p>
                            
                            {!showNewAddressForm ? (
                                <button className="btn btn-ghost btn-sm" onClick={() => setShowNewAddressForm(true)}>
                                    Atualizar Endereço
                                </button>
                            ) : (
                                <div className="mt-md pt-lg" style={{ borderTop: '1px solid var(--color-border)' }}>
                                    <h3 className="text-sm font-bold mb-md">Novo Endereço</h3>
                                    
                                    <div className="grid-cols-2 gap-md mb-sm" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
                                        <div className="form-group">
                                            <label className="input-label">CEP</label>
                                            <input className="input" placeholder="00000-000" value={cep} onChange={handleCepChange} maxLength={9} />
                                            {isFetchingCep && <span className="text-xs text-primary mt-1">Buscando...</span>}
                                        </div>
                                        <div className="form-group">
                                            <label className="input-label">Rua / Logradouro</label>
                                            <input className="input" placeholder="Rua das Flores..." value={logradouro} onChange={e => setLogradouro(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="grid-cols-2 gap-md mb-sm" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
                                        <div className="form-group">
                                            <label className="input-label">Número</label>
                                            <input id="setting-numero" className="input" placeholder="123" value={numero} onChange={e => setNumero(e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="input-label">Complemento</label>
                                            <input className="input" placeholder="Bloco A, Apto 101" value={complemento} onChange={e => setComplemento(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="grid-cols-3 gap-md" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                                        <div className="form-group">
                                            <label className="input-label">Bairro</label>
                                            <input className="input" value={bairro} onChange={e => setBairro(e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="input-label">Cidade</label>
                                            <input className="input" value={cidade} onChange={e => setCidade(e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="input-label">UF</label>
                                            <input className="input" value={estado} onChange={e => setEstado(e.target.value)} maxLength={2} />
                                        </div>
                                    </div>
                                    
                                    <button className="btn btn-ghost btn-sm mt-md" onClick={() => setShowNewAddressForm(false)}>
                                        Cancelar Alteração de Endereço
                                    </button>
                                </div>
                            )}
                        </div>

                        <button className="btn btn-primary mt-sm" style={{ alignSelf: 'flex-start' }} onClick={handleSaveCondo} disabled={saving}>
                            <Save size={16} /> Salvar Alterações do Condomínio
                        </button>
                    </div>
                </div>

                {/* Profile Settings */}
                <div className="card">
                    <div className="flex items-center gap-sm mb-lg">
                        <User size={20} color="var(--color-accent)" />
                        <h2 className="text-lg font-semibold">Perfil do Síndico</h2>
                    </div>

                    <div className="flex flex-col gap-lg">
                        <div className="grid-cols-2 gap-md" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
                            <div className="form-group">
                                <label className="input-label">Nome Completo</label>
                                <input
                                    className="input"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Seu nome"
                                />
                            </div>
                            <div className="form-group">
                                <label className="input-label">Telefone / WhatsApp</label>
                                <input
                                    className="input"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(XX) XXXXX-XXXX"
                                />
                            </div>
                        </div>
                        
                        <div className="grid-cols-2 gap-md" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
                            <div className="form-group">
                                <label className="input-label">CPF do Responsável</label>
                                <input
                                    className="input"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                    placeholder="000.000.000-00"
                                />
                            </div>
                            <div></div>
                        </div>

                        <button className="btn btn-primary mt-sm" style={{ alignSelf: 'flex-start' }} onClick={handleSaveProfile} disabled={saving}>
                            <Save size={16} /> Atualizar Meu Perfil
                        </button>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="card">
                    <div className="flex items-center gap-sm mb-lg">
                        <Lock size={20} color="var(--color-primary)" />
                        <h2 className="text-lg font-semibold">Segurança</h2>
                    </div>

                    <div className="flex flex-col gap-lg">
                        <div className="form-group">
                            <label className="input-label">Novo E-mail</label>
                            <input
                                className="input"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder={user?.email || 'novo@email.com (deixe em branco se não for alterar)'}
                            />
                        </div>

                        <div className="grid-cols-2 gap-md" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
                            <div className="form-group">
                                <label className="input-label" style={{ color: 'var(--color-danger)' }}>Confirme a Senha Atual *</label>
                                <input
                                    className="input"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Obrigatória para aplicar alterações"
                                />
                            </div>
                            <div className="form-group">
                                <label className="input-label">Nova Senha</label>
                                <input
                                    className="input"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Deixe em branco se não for alterar"
                                />
                            </div>
                        </div>
                        
                        <button className="btn btn-primary mt-sm" style={{ alignSelf: 'flex-start', background: 'var(--color-primary)' }} onClick={handleSaveSecurity} disabled={saving}>
                            <Save size={16} /> Aplicar Alterações de Segurança
                        </button>
                    </div>
                </div>

                {/* Plan Info */}
                <div className="card" style={{ borderColor: 'rgba(234, 179, 8, 0.4)' }}>
                    <div className="flex items-center justify-between mb-md">
                        <div className="flex items-center gap-sm">
                            <CreditCard size={20} color="#eab308" />
                            <h2 className="text-lg font-semibold">Assinatura e Plano</h2>
                        </div>
                        {/* @ts-ignore */}
                        {(condominium as any)?.status === 'cancelled' && (
                            <span className="badge" style={{ background: 'var(--color-danger-alpha)', color: 'var(--color-danger)' }}>Cancelado</span>
                        )}
                    </div>
                    
                    <div className="flex flex-col gap-lg">
                        <div className="flex items-center gap-md">
                            <span className="badge badge-admin" style={{ fontSize: 'var(--font-md)', padding: '6px 16px' }}>
                                PLANO {(condominium as any)?.plan?.toUpperCase() || 'FREE'}
                            </span>
                            <span className="text-sm text-muted">
                                {condominium?.unit_limit ? `Limite de ${condominium.unit_limit} unidades` : 'Unidades ilimitadas'}
                            </span>
                        </div>

                        {(condominium as any)?.status !== 'cancelled' && (
                            <div className="flex items-center gap-md border-t border-border pt-md">
                                {(condominium as any)?.plan !== 'pro' && (
                                    <button className="btn btn-primary" onClick={() => handleChangePlan('pro')} disabled={saving || (condominium as any)?.plan === 'pro'}>
                                        Fazer Upgrade para o Pro
                                    </button>
                                )}
                                {(condominium as any)?.plan !== 'basic' && (
                                    <button className="btn btn-ghost" onClick={() => handleChangePlan('basic')} disabled={saving || (condominium as any)?.plan === 'basic'}>
                                        Mudar para Starter (Basic)
                                    </button>
                                )}
                                <button className="btn btn-ghost" style={{ color: 'var(--color-danger)' }} onClick={handleCancelPlan} disabled={saving}>
                                    <AlertTriangle size={16} style={{marginRight: 6}} /> Cancelar Assinatura
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
