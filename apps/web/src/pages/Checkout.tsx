import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { Payment, initMercadoPago } from '@mercadopago/sdk-react';
import logo from '../assets/logo.png';
import './Checkout.css';
import { processPayment } from '../services/payment';
import { registerCondoManager } from '../services/registration';
import { useAuth } from '../contexts/AuthContext';

// Initialize Mercado Pago with Public Key from environment
const mpKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '';
if (mpKey) {
    initMercadoPago(mpKey, { locale: 'pt-BR' });
}

export default function Checkout() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const plan = searchParams.get('plan') || 'pro';
    const isUpgrade = searchParams.get('upgrade') === 'true';
    const { user, profile, condominium } = useAuth();

    const [step, setStep] = useState(isUpgrade ? 2 : 1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'approved' | 'pending'>('approved');
    const [pixData, setPixData] = useState<{ code: string; qrCode: string } | null>(null);
    const [isFetchingCep, setIsFetchingCep] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        condoName: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        units: '',
        managerName: '',
        managerEmail: '',
        managerPhone: '',
        managerCpf: '',
        password: '',
    });

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        
        setFormData(prev => ({ ...prev, cep: value }));
        
        const plainCep = value.replace(/\D/g, '');
        if (plainCep.length === 8) {
            setIsFetchingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${plainCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        logradouro: data.logradouro || '',
                        bairro: data.bairro || '',
                        cidade: data.localidade || '',
                        estado: data.uf || '',
                    }));
                    setTimeout(() => document.getElementById('numero')?.focus(), 100);
                }
            } catch (err) {
                console.error('Erro ao buscar CEP:', err);
            } finally {
                setIsFetchingCep(false);
            }
        }
    };

    const getPlanDetails = () => {
        if (plan === 'starter') return { name: 'Starter', price: 199, period: '/mês' };
        return { name: 'Pro', price: 399, period: '/mês' };
    };

    const planDetails = getPlanDetails();

    const handleNext = () => {
        if (step < 2) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else navigate('/');
    };

    // For upgrade mode, use the authenticated user's data
    const payerEmail = isUpgrade ? (user?.email || '') : formData.managerEmail;
    const payerName = isUpgrade ? (profile?.full_name || '') : formData.managerName;
    const payerCpf = isUpgrade ? ((profile as any)?.cpf || '') : formData.managerCpf;

    const initialization = {
        amount: planDetails.price,
        payer: {
            email: payerEmail,
            first_name: payerName.split(' ')[0],
            last_name: payerName.split(' ').slice(1).join(' '),
            entity_type: 'individual',
            identification: {
                type: 'CPF',
                number: payerCpf.replace(/\D/g, ''),
            },
        },
    };

    const customization: any = {
        paymentMethods: {
            ticket: 'all',
            bankTransfer: 'all',
            creditCard: 'all',
            debitCard: 'all',
        },
        visual: {
            style: {
                theme: 'dark',
                customVariables: {
                    formBackgroundColor: '#1a1a2e',
                    baseColor: '#6c5ce7',
                    baseColorFirstVariant: '#a29bfe',
                    baseColorSecondVariant: '#5a4bd1',
                    fontSizeExtraSmall: '0.6875rem',
                    fontSizeSmall: '0.8125rem',
                    fontSizeMedium: '0.9375rem',
                    fontSizeLarge: '1.0625rem',
                    fontSizeExtraLarge: '1.25rem',
                    buttonTextColor: '#ffffff',
                    successColor: '#00b894',
                    warningColor: '#fdcb6e',
                    inputBackgroundColor: '#1a1a2e',
                }
            }
        }
    };

    const onSubmit = async ({ formData: paymentData }: any) => {
        setIsProcessing(true);
        try {
            let userId: string | undefined;

            if (isUpgrade) {
                // UPGRADE FLOW: User already exists, just process payment
                userId = user?.id;
            } else {
                // NEW REGISTRATION FLOW
                const fullAddress = `${formData.logradouro}, ${formData.numero}${formData.complemento ? ' - ' + formData.complemento : ''} - ${formData.bairro}, ${formData.cidade} - ${formData.estado}, CEP: ${formData.cep}`;

                // STEP 1: Register user — trigger creates Profile + Condominium + Staff + Subscription
                const authData = await registerCondoManager({
                    condoName: formData.condoName,
                    address: fullAddress,
                    units: formData.units,
                    managerName: formData.managerName,
                    managerEmail: formData.managerEmail,
                    managerPhone: formData.managerPhone,
                    managerCpf: formData.managerCpf,
                    plan: planDetails.name.toLowerCase() === 'starter' ? 'basic' : 'pro',
                    password: formData.password
                });

                userId = authData?.user?.id;
            }

            // Process payment via Edge Function (server-side, secure)
            const result = await processPayment(paymentData, condominium?.id, userId);

            // Save Pix data if available
            if (result?.qrCodeString || result?.qrCodeBase64) {
                setPixData({ code: result.qrCodeString, qrCode: result.qrCodeBase64 });
            }

            // Show appropriate success screen
            setPaymentStatus(result?.status === 'approved' ? 'approved' : 'pending');
            setStep(4);
        } catch (error: any) {
            console.error('Checkout error:', error);

            if (error.message?.includes('rate limit') || error.status === 429) {
                alert('Muitas tentativas de cadastro. Por favor, aguarde alguns minutos e tente novamente.');
            } else if (error.message?.includes('User already registered')) {
                alert('Este email já está cadastrado no sistema.\n\nSe você está testando no Sandbox do Mercado Pago, lembre-se de que cada teste de checkout com o mesmo email tentará recriar o usuário. Tente fazer login ou use um email de teste diferente (ex: comprador+2@teste.com).');
            } else if (error.message?.includes('cc_rejected') || error.message?.includes('rejected')) {
                alert('Pagamento recusado. Verifique os dados do cartão e tente novamente.');
            } else {
                alert(`Ocorreu um erro: ${error.message || 'Verifique os dados e tente novamente.'}`);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const onError = async (error: any) => {
        console.error('Mercado Pago Error:', error);
    };

    const onReady = async () => {
        // Brick is ready
    };

    const renderStep1 = () => (
        <div className="checkout-card">
            <div className="checkout-header">
                <h2 className="checkout-title">Dados do Condomínio</h2>
                <p className="checkout-subtitle">Preencha as informações para criar sua conta</p>
            </div>

            <div className="form-group mb-md">
                <label className="input-label">Nome do Condomínio</label>
                <input
                    className="input"
                    placeholder="Ex: Edifício Solar"
                    value={formData.condoName}
                    onChange={e => setFormData({ ...formData, condoName: e.target.value })}
                />
            </div>

            <div className="grid-cols-2 gap-md" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
                <div className="form-group mb-md">
                    <label className="input-label">CEP</label>
                    <input
                        className="input"
                        placeholder="00000-000"
                        value={formData.cep}
                        onChange={handleCepChange}
                        maxLength={9}
                    />
                    {isFetchingCep && <span style={{ fontSize: '12px', color: 'var(--color-primary)', marginTop: '4px' }}>Buscando...</span>}
                </div>
                <div className="form-group mb-md">
                    <label className="input-label">Rua / Logradouro</label>
                    <input
                        className="input"
                        placeholder="Rua das Flores..."
                        value={formData.logradouro}
                        onChange={e => setFormData({ ...formData, logradouro: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid-cols-2 gap-md" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group mb-md">
                    <label className="input-label">Número</label>
                    <input
                        id="numero"
                        className="input"
                        placeholder="123"
                        value={formData.numero}
                        onChange={e => setFormData({ ...formData, numero: e.target.value })}
                    />
                </div>
                <div className="form-group mb-md">
                    <label className="input-label">Complemento</label>
                    <input
                        className="input"
                        placeholder="Bloco A, Apto 101"
                        value={formData.complemento}
                        onChange={e => setFormData({ ...formData, complemento: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid-cols-3 gap-md" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="form-group mb-md">
                    <label className="input-label">Bairro</label>
                    <input
                        className="input"
                        placeholder="Centro"
                        value={formData.bairro}
                        onChange={e => setFormData({ ...formData, bairro: e.target.value })}
                    />
                </div>
                <div className="form-group mb-md">
                    <label className="input-label">Cidade</label>
                    <input
                        className="input"
                        placeholder="São Paulo"
                        value={formData.cidade}
                        onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                    />
                </div>
                <div className="form-group mb-md">
                    <label className="input-label">UF</label>
                    <input
                        className="input"
                        placeholder="SP"
                        value={formData.estado}
                        onChange={e => setFormData({ ...formData, estado: e.target.value })}
                        maxLength={2}
                    />
                </div>
            </div>
            <div className="form-group mb-xl">
                <label className="input-label">Quantidade de Unidades (Aprox.)</label>
                <input
                    className="input"
                    type="number"
                    placeholder="Ex: 80"
                    value={formData.units}
                    onChange={e => setFormData({ ...formData, units: e.target.value })}
                />
            </div>

            <div className="checkout-header">
                <h2 className="checkout-title">Dados do Responsável</h2>
            </div>

            <div className="form-group mb-md">
                <label className="input-label">Nome Completo</label>
                <input
                    className="input"
                    placeholder="Seu nome"
                    value={formData.managerName}
                    onChange={e => setFormData({ ...formData, managerName: e.target.value })}
                />
            </div>
            <div className="grid-cols-2 gap-md" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group mb-md">
                    <label className="input-label">Email</label>
                    <input
                        className="input"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.managerEmail}
                        onChange={e => setFormData({ ...formData, managerEmail: e.target.value })}
                    />
                </div>
                <div className="form-group mb-md">
                    <label className="input-label">Senha de Acesso</label>
                    <input
                        className="input"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>
                <div className="form-group mb-md">
                    <label className="input-label">Telefone / WhatsApp</label>
                    <input
                        className="input"
                        placeholder="(11) 99999-9999"
                        value={formData.managerPhone}
                        onChange={e => setFormData({ ...formData, managerPhone: e.target.value })}
                    />
                </div>
            </div>
            <div className="form-group mb-lg">
                <label className="input-label">CPF</label>
                <input
                    className="input"
                    placeholder="000.000.000-00"
                    value={formData.managerCpf}
                    onChange={e => setFormData({ ...formData, managerCpf: e.target.value })}
                />
            </div>

            <button className="btn btn-primary btn-lg w-full" onClick={handleNext}>Continuar</button>
        </div>
    );

    const renderStep2 = () => (
        <div className="checkout-card">
            <div className="checkout-header">
                <h2 className="checkout-title">{isUpgrade ? 'Confirmar Upgrade' : 'Pagamento'}</h2>
                <p className="checkout-subtitle">Seguro e processado pelo Mercado Pago</p>
            </div>

            <div className="bg-surface-light p-lg rounded-lg mb-lg border border-border">
                <div className="review-row">
                    <span className="text-muted">Plano</span>
                    <span className="font-bold">{planDetails.name}</span>
                </div>
                <div className="review-total mt-sm pt-sm border-t border-border">
                    <span>Total a pagar</span>
                    <span className="text-success text-xl">R$ {planDetails.price}</span>
                </div>
            </div>

            {isProcessing && (
                <div style={{
                    textAlign: 'center',
                    padding: '1rem',
                    color: 'var(--color-primary)',
                    fontWeight: 500,
                    marginBottom: '1rem'
                }}>
                    ⏳ {isUpgrade ? 'Processando pagamento...' : 'Processando pagamento e criando sua conta...'}
                </div>
            )}

            {!mpKey ? (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--color-danger)',
                    background: 'var(--color-danger-alpha)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                }}>
                    <AlertCircle size={20} />
                    Chave do Mercado Pago não configurada. Verifique o arquivo .env
                </div>
            ) : (
                <Payment
                    initialization={initialization}
                    customization={customization}
                    onSubmit={onSubmit}
                    onReady={onReady}
                    onError={onError}
                />
            )}

            <button className="btn btn-ghost w-full mt-md" onClick={isUpgrade ? () => navigate('/dashboard/settings') : handleBack} disabled={isProcessing}>
                {isUpgrade ? 'Cancelar' : 'Voltar'}
            </button>
        </div>
    );

    const renderStep4 = () => (
        <div className="checkout-card text-center">
            <div className="mb-xl flex justify-center">
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: paymentStatus === 'approved' ? 'var(--color-success-alpha)' : 'rgba(234,179,8,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: paymentStatus === 'approved' ? 'var(--color-success)' : '#ca8a04'
                }}>
                    <CheckCircle size={48} />
                </div>
            </div>

            {paymentStatus === 'approved' ? (
                <>
                    <h2 className="checkout-title">Pagamento Confirmado!</h2>
                    {isUpgrade ? (
                        <>
                            <p className="checkout-subtitle mb-xl">
                                Seu plano foi atualizado para <strong>{planDetails.name}</strong> com sucesso!
                            </p>
                            <button className="btn btn-primary btn-lg w-full" onClick={() => navigate('/dashboard/settings')}>
                                Voltar ao Painel
                            </button>
                        </>
                    ) : (
                        <p className="checkout-subtitle mb-xl">
                            Sua assinatura do plano <strong>{planDetails.name}</strong> está ativa.<br />
                            Enviamos um email de confirmação para <strong>{formData.managerEmail}</strong>.<br />
                            Confirme seu email e depois faça login para acessar o painel.
                        </p>
                    )}
                </>
            ) : (
                <>
                    <h2 className="checkout-title">Aguardando Pagamento</h2>
                    <p className="checkout-subtitle mb-lg">
                        Seu cadastro foi realizado! Assim que o pagamento for confirmado, seu plano <strong>{planDetails.name}</strong> será liberado.
                    </p>

                    {pixData && (
                        <div className="bg-surface-light p-md rounded-lg mb-xl border border-border text-left">
                            <h3 className="text-md font-bold mb-md text-center">Pague via Pix</h3>
                            {pixData.qrCode && (
                                <div className="flex justify-center mb-md">
                                    <img src={`data:image/jpeg;base64,${pixData.qrCode}`} alt="QR Code Pix" style={{ width: 160, height: 160 }} />
                                </div>
                            )}
                            <div className="mb-xs text-sm text-muted font-bold uppercase">Pix Copia e Cola:</div>
                            <div className="flex gap-sm">
                                <input 
                                    className="input text-sm flex-1" 
                                    value={pixData.code} 
                                    readOnly 
                                    style={{ fontFamily: 'monospace' }}
                                />
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => {
                                        navigator.clipboard.writeText(pixData.code);
                                        alert('Código Pix copiado!');
                                    }}
                                >
                                    Copiar
                                </button>
                            </div>
                        </div>
                    )}

                    <button className="btn btn-ghost btn-lg w-full" onClick={() => navigate('/login')}>
                        Ir para o Login
                    </button>
                </>
            )}
        </div>
    );

    return (
        <div className="checkout-page">
            <div className="landing-nav" style={{ position: 'absolute' }}>
                <div className="landing-container landing-flex">
                    <div className="landing-logo cursor-pointer" onClick={() => navigate('/')}>
                        <img src={logo} alt="Kond" style={{ height: 40 }} />
                    </div>
                    <div className="flex items-center gap-sm text-sm text-muted">
                        <Shield size={14} /> Ambiente Seguro
                    </div>
                </div>
            </div>

            <div className="checkout-container">
                {step < 4 && (
                    <div className="plan-summary">
                        <div>
                            <div className="text-sm text-muted uppercase font-bold mb-xs">Plano Escolhido</div>
                            <div className="plan-name">{planDetails.name}</div>
                        </div>
                        <div className="plan-price">R$ {planDetails.price}<span className="text-sm text-muted font-normal">{planDetails.period}</span></div>
                    </div>
                )}

                {step < 4 && (
                    <div className="checkout-steps">
                        <div className={`step-indicator ${step >= 1 ? (step > 1 ? 'step-completed' : 'step-active') : ''}`}>
                            <div className="step-number">{step > 1 ? <CheckCircle size={16} /> : '1'}</div>
                            <div className="step-label">Dados</div>
                        </div>
                        <div className={`step-indicator ${step >= 2 ? (step > 2 ? 'step-completed' : 'step-active') : ''}`}>
                            <div className="step-number">{step > 2 ? <CheckCircle size={16} /> : '2'}</div>
                            <div className="step-label">Pagamento</div>
                        </div>
                    </div>
                )}

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 4 && renderStep4()}
            </div>
        </div>
    );
}
