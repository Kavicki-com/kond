import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Building, CheckCircle, Shield } from 'lucide-react';
import logo from '../assets/logo.png';
import './Checkout.css';

export default function Checkout() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const plan = searchParams.get('plan') || 'pro';

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        condoName: '',
        address: '',
        units: '',
        managerName: '',
        managerEmail: '',
        managerPhone: '',
        managerCpf: '',
        paymentMethod: 'credit_card'
    });

    const getPlanDetails = () => {
        if (plan === 'starter') return { name: 'Starter', price: 'R$ 199', period: '/mês' };
        return { name: 'Pro', price: 'R$ 399', period: '/mês' };
    };

    const planDetails = getPlanDetails();

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else handleSubmit();
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else navigate('/');
    };

    const handleSubmit = async () => {
        setLoading(true);
        // Simulate API Confirm
        setTimeout(() => {
            setLoading(false);
            setStep(4);
        }, 2000);
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
                <p className="checkout-subtitle">Escolha como deseja pagar</p>
            </div>

            <div className="payment-grid">
                <div
                    className={`payment-option ${formData.paymentMethod === 'credit_card' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'credit_card' })}
                >
                    <CreditCard size={32} className="payment-icon" />
                    <div className="font-bold">Cartão de Crédito</div>
                    <div className="text-xs text-muted">Aprovação imediata</div>
                </div>
                <div
                    className={`payment-option ${formData.paymentMethod === 'pix' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'pix' })}
                >
                    <div className="font-bold text-2xl mb-sm" style={{ color: 'var(--color-success)' }}>PIX</div>
                    <div className="font-bold">PIX</div>
                    <div className="text-xs text-muted">Aprovação imediata</div>
                </div>
            </div>

            {formData.paymentMethod === 'credit_card' ? (
                <div className="card-form">
                    <div className="form-group mb-md">
                        <label className="input-label">Número do Cartão</label>
                        <input className="input" placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className="grid-cols-2 gap-md" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                        <div className="form-group mb-md">
                            <label className="input-label">Validade</label>
                            <input className="input" placeholder="MM/AA" />
                        </div>
                        <div className="form-group mb-md">
                            <label className="input-label">CVV</label>
                            <input className="input" placeholder="123" />
                        </div>
                    </div>
                    <div className="form-group mb-md">
                        <label className="input-label">Nome no Cartão</label>
                        <input className="input" placeholder="Como impresso no cartão" />
                    </div>
                </div>
            ) : (
                <div className="text-center p-xl bg-surface-light rounded-lg mb-lg">
                    <p className="mb-md">O código PIX será gerado na próxima etapa.</p>
                </div>
            )}

            <button className="btn btn-primary btn-lg w-full mb-md" onClick={handleNext}>Revisar Pedido</button>
            <button className="btn btn-ghost w-full" onClick={handleBack}>Voltar</button>
        </div>
    );

    const renderStep3 = () => (
        <div className="checkout-card">
            <div className="checkout-header">
                <h2 className="checkout-title">Revisão</h2>
                <p className="checkout-subtitle">Confira os dados antes de finalizar</p>
            </div>

            <div className="bg-surface-light p-lg rounded-lg mb-lg border border-border">
                <div className="review-row">
                    <span className="text-muted">Plano</span>
                    <span className="font-bold">{planDetails.name}</span>
                </div>
                <div className="review-row">
                    <span className="text-muted">Condomínio</span>
                    <span className="font-bold">{formData.condoName || 'Não informado'}</span>
                </div>
                <div className="review-row">
                    <span className="text-muted">Pagamento</span>
                    <span className="font-bold">{formData.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'PIX'}</span>
                </div>
                <div className="review-total">
                    <span>Total</span>
                    <span className="text-success">{planDetails.price}{planDetails.period}</span>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-lg">
                    <div className="spinner spinner-lg mx-auto mb-md"></div>
                    <p>Processando pagamento...</p>
                </div>
            ) : (
                <>
                    <button className="btn btn-primary btn-lg w-full mb-md" onClick={handleSubmit}>Confirmar e Assinar</button>
                    <button className="btn btn-ghost w-full" onClick={handleBack}>Voltar</button>
                </>
            )}
        </div>
    );

    const renderStep4 = () => (
        <div className="checkout-card text-center">
            <div className="mb-xl flex justify-center">
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'var(--color-success-alpha)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-success)'
                }}>
                    <CheckCircle size={48} />
                </div>
            </div>

            <h2 className="checkout-title">Sucesso!</h2>
            <p className="checkout-subtitle mb-xl">
                Sua assinatura do plano <strong>{planDetails.name}</strong> foi confirmada.
                Enviamos um email para <strong>{formData.managerEmail}</strong> com os detalhes de acesso.
            </p>

            <button className="btn btn-primary btn-lg w-full" onClick={() => navigate('/login')}>
                Acessar Painel
            </button>
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
                        <div className="plan-price">{planDetails.price}<span className="text-sm text-muted font-normal">{planDetails.period}</span></div>
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
                        <div className={`step-indicator ${step >= 3 ? (step > 3 ? 'step-completed' : 'step-active') : ''}`}>
                            <div className="step-number">{step > 3 ? <CheckCircle size={16} /> : '3'}</div>
                            <div className="step-label">Revisão</div>
                        </div>
                    </div>
                )}

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
            </div>
        </div>
    );
}
