import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Building, Shield, Zap, Users, Star, Lock } from 'lucide-react';
import logo from '../assets/logo.png';
import './Landing.css';

export default function Landing() {
    const navigate = useNavigate();

    const handleLogin = () => navigate('/login');
    const handleCheckout = (plan: string) => navigate(`/checkout?plan=${plan}`);

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="landing-container landing-flex">
                    <div className="landing-logo">
                        <img src={logo} alt="Kond" style={{ height: 40 }} />
                    </div>
                    <div className="landing-menu">
                        <a href="#features" className="landing-link">Funcionalidades</a>
                        <a href="#pricing" className="landing-link">Planos</a>
                        <a href="#testimonials" className="landing-link">Depoimentos</a>
                    </div>
                    <button className="btn btn-secondary" onClick={handleLogin}>
                        Entrar <ArrowRight size={16} />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-glow" />
                <div className="hero-content">
                    <div className="hero-badge">
                        <Zap size={14} />
                        Gestão Inteligente de Encomendas
                    </div>
                    <h1 className="hero-title">
                        Simplifique a Logística<br /> do seu Condomínio
                    </h1>
                    <p className="hero-subtitle">
                        Automatize o recebimento, notificação e entrega de encomendas. Mais segurança para a portaria, mais comodidade para os moradores.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn btn-primary btn-lg" onClick={() => handleCheckout('pro')}>
                            Começar Agora
                        </button>
                        <button className="btn btn-secondary btn-lg" onClick={() => document.getElementById('features')?.scrollIntoView()}>
                            Saiba Mais
                        </button>
                    </div>
                </div>
            </section>

            {/* Features (Problem & Solution) */}
            <section id="features" className="section">
                <div className="landing-container">
                    <div className="section-header">
                        <h2 className="section-title">O fim da papelada na portaria</h2>
                        <p className="section-subtitle">
                            Substitua cadernos manuais e planilhas confusas por um sistema digital, seguro e fácil de usar.
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon"><Building size={24} /></div>
                            <h3 className="feature-title">Organização Total</h3>
                            <p className="feature-desc">
                                Registre encomendas em segundos com fotos e notifique os moradores automaticamente via app.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><Shield size={24} /></div>
                            <h3 className="feature-title">Segurança Garantida</h3>
                            <p className="feature-desc">
                                Controle rigoroso de quem retirou cada pacote, com data, hora e assinatura digital via QR Code.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><Zap size={24} /></div>
                            <h3 className="feature-title">Notificações em Tempo Real</h3>
                            <p className="feature-desc">
                                Moradores recebem alertas instantâneos no celular assim que a encomenda chega na portaria.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="section" style={{ background: 'var(--color-bg-elevated)' }}>
                <div className="landing-container">
                    <div className="section-header">
                        <h2 className="section-title">Planos Transparentes</h2>
                        <p className="section-subtitle">
                            Escolha a melhor opção para o tamanho do seu condomínio. Sem taxas escondidas.
                        </p>
                    </div>

                    <div className="pricing-grid">
                        {/* Starter */}
                        <div className="pricing-card">
                            <h3 className="pricing-plan">Starter</h3>
                            <div className="pricing-price">R$ 199<span className="pricing-period">/mês</span></div>
                            <p className="text-secondary text-sm mb-lg">Para condomínios pequenos</p>

                            <div className="pricing-features">
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> Até 50 unidades</div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> App para Moradores</div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> App para Portaria</div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> Suporte por Email</div>
                            </div>

                            <button className="btn btn-secondary w-full" onClick={() => handleCheckout('starter')}>
                                Assinar Starter
                            </button>
                        </div>

                        {/* Pro */}
                        <div className="pricing-card pricing-featured">
                            <div className="pricing-badge">Mais Popular</div>
                            <h3 className="pricing-plan">Pro</h3>
                            <div className="pricing-price" style={{ color: 'var(--color-primary-light)' }}>R$ 399<span className="pricing-period">/mês</span></div>
                            <p className="text-secondary text-sm mb-lg">Para condomínios médios e grandes</p>

                            <div className="pricing-features">
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-primary)" /> <strong>Unidades Ilimitadas</strong></div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-primary)" /> App para Moradores</div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-primary)" /> App para Portaria</div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-primary)" /> QR Code de Retirada</div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-primary)" /> Suporte Prioritário (WhatsApp)</div>
                            </div>

                            <button className="btn btn-primary btn-lg w-full" onClick={() => handleCheckout('pro')}>
                                Assinar Pro
                            </button>
                        </div>

                        {/* Enterprise */}
                        <div className="pricing-card">
                            <h3 className="pricing-plan">Enterprise</h3>
                            <div className="pricing-price">Sob Consulta</div>
                            <p className="text-secondary text-sm mb-lg">Para administradoras</p>

                            <div className="pricing-features">
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> Múltiplos Condomínios</div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> Painel Centralizado</div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> Integração via API</div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> Gerente de Conta</div>
                            </div>

                            <button className="btn btn-secondary w-full" onClick={() => window.location.href = 'mailto:comercial@kond.com'}>
                                Falar com Consultor
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="section">
                <div className="landing-container">
                    <div className="section-header">
                        <h2 className="section-title">O que dizem nossos clientes</h2>
                    </div>

                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <p className="testimonial-text">"Desde que implantamos o Kond, as reclamações sobre encomendas sumidas acabaram. A portaria ficou muito mais ágil."</p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar">RC</div>
                                <div>
                                    <div className="font-bold">Roberto Carlos</div>
                                    <div className="text-sm text-secondary">Síndico - Ed. Solar</div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <p className="testimonial-text">"O aplicativo é muito fácil de usar. Recebo a notificação no trabalho e já passo na portaria sabendo o que chegou."</p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar">AM</div>
                                <div>
                                    <div className="font-bold">Ana Maria</div>
                                    <div className="text-sm text-secondary">Moradora - Cond. Jardins</div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <p className="testimonial-text">"Melhor investimento que fizemos para a segurança do prédio. O registro com foto evita qualquer confusão."</p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar">JS</div>
                                <div>
                                    <div className="font-bold">João Silva</div>
                                    <div className="text-sm text-secondary">Zelador - Residencial Parque</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="landing-container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="landing-logo mb-md">
                                <img src={logo} alt="Kond" style={{ height: 32 }} />
                            </div>
                            <p className="footer-desc">
                                Transformando a gestão de encomendas em condomínios com tecnologia e simplicidade.
                            </p>
                        </div>

                        <div className="footer-links">
                            <h4 className="footer-heading">Produto</h4>
                            <a href="#features" className="footer-link">Funcionalidades</a>
                            <a href="#pricing" className="footer-link">Planos</a>
                            <a href="#" className="footer-link">App Portaria</a>
                            <a href="#" className="footer-link">App Morador</a>
                        </div>

                        <div className="footer-links">
                            <h4 className="footer-heading">Empresa</h4>
                            <a href="#" className="footer-link">Sobre Nós</a>
                            <a href="#" className="footer-link">Blog</a>
                            <a href="#" className="footer-link">Carreiras</a>
                            <a href="#" className="footer-link">Contato</a>
                        </div>

                        <div className="footer-links">
                            <h4 className="footer-heading">Legal</h4>
                            <button className="footer-link text-left bg-transparent p-0" onClick={() => navigate('/terms')}>Termos de Uso</button>
                            <button className="footer-link text-left bg-transparent p-0" onClick={() => navigate('/privacy')}>Política de Privacidade</button>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        Kond - 2026 - Todos os direitos reservados. Uma empresa <a href="https://kavicki.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>Kavicki.com</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
