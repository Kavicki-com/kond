import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Shield } from 'lucide-react';
import { Payment, initMercadoPago } from '@mercadopago/sdk-react';
import logo from '../assets/logo.png';
import './Checkout.css';
import { processPayment } from '../services/payment';
import { registerCondoManager } from '../services/registration';

// Initialize Mercado Pago with Public Key
initMercadoPago('TEST-b703b043-652f-4e46-8829-9e7367ee1cb1', {
    locale: 'pt-BR'
});

export default function Checkout() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const plan = searchParams.get('plan') || 'pro';

    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'approved' | 'pending'>('approved');

    // Form State
    const [formData, setFormData] = useState({
        condoName: '',
        address: '',
        units: '',
        managerName: '',
        managerEmail: '',
        managerPhone: '',
        managerCpf: '',
        password: '',
    });

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

    const initialization = {
        amount: planDetails.price,
        payer: {
            email: formData.managerEmail,
            first_name: formData.managerName.split(' ')[0],
            last_name: formData.managerName.split(' ').slice(1).join(' '),
            identification: {
                type: 'CPF',
                number: formData.managerCpf.replace(/\D/g, ''),
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
    };

    const onSubmit = async ({ formData: paymentData }: any) => {
        setIsProcessing(true);
        try {
            // STEP 1: Register user — trigger creates Profile + Condominium + Staff + Subscription
            const authData = await registerCondoManager({
                condoName: formData.condoName,
                address: formData.address,
                units: formData.units,
                managerName: formData.managerName,
                managerEmail: formData.managerEmail,
                managerPhone: formData.managerPhone,
                managerCpf: formData.managerCpf,
                plan: planDetails.name.toLowerCase() === 'starter' ? 'basic' : 'pro',
                password: formData.password
            });

            // STEP 2: Get condominium_id — pass userId to Edge Function which uses service_role
            const userId = authData?.user?.id;

            // STEP 3: Process payment via Edge Function (server-side, secure)
            const result = await processPayment(paymentData, undefined, userId);

            // STEP 4: Show appropriate success screen
            setPaymentStatus(result?.status === 'approved' ? 'approved' : 'pending');
            setStep(4);
        } catch (error: any) {
            console.error('Checkout error:', error);

            if (error.message?.includes('rate limit') || error.status === 429) {
                alert('Muitas tentativas de cadastro. Por favor, aguarde alguns minutos e tente novamente.');
            } else if (error.message?.includes('User already registered')) {
                alert('Este email já está cadastrado. Tente fazer login ou usar outro email.');
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
            <div className="form-group mb-md">
                <label className="input-label">Endereço Completo</label>
                <input
                    className="input"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
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
                <h2 className="checkout-title">Pagamento</h2>
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
                    ⏳ Processando pagamento e criando sua conta...
                </div>
            )}

            <Payment
                initialization={initialization}
                customization={customization}
                onSubmit={onSubmit}
                onReady={onReady}
                onError={onError}
            />

            <button className="btn btn-ghost w-full mt-md" onClick={handleBack} disabled={isProcessing}>Voltar</button>
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
                    <p className="checkout-subtitle mb-xl">
                        Sua assinatura do plano <strong>{planDetails.name}</strong> está ativa.<br />
                        Enviamos um email de confirmação para <strong>{formData.managerEmail}</strong>.<br />
                        Confirme seu email e depois faça login para acessar o painel.
                    </p>

                </>
            ) : (
                <>
                    <h2 className="checkout-title">Cadastro Realizado!</h2>
                    <p className="checkout-subtitle mb-xl">
                        Seu pagamento está <strong>aguardando confirmação</strong>.
                        Assim que o pagamento for confirmado, seu acesso ao plano <strong>{planDetails.name}</strong> será liberado automaticamente.
                        Verifique seu email <strong>{formData.managerEmail}</strong> para instruções de pagamento.
                    </p>
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
