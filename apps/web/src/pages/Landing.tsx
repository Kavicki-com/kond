import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, Check, Zap,
    Smartphone, Monitor, ChevronDown, ChevronUp
} from 'lucide-react';
import logo from '../assets/logo.png';
import './Landing.css';

export default function Landing() {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const handleLogin = () => navigate('/login');
    const handleCheckout = (plan: string) => navigate(`/checkout?plan=${plan}`);

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Mensagem enviada com sucesso! Entraremos em contato em breve.");
        setIsContactModalOpen(false);
    };

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        { q: "Como funciona a cobrança?", a: "A cobrança é mensal e pré-paga, feita via Pix ou Cartão de Crédito. Sem taxas escondidas, sem fidelidade ou multa de cancelamento." },
        { q: "É difícil treinar a portaria para usar o sistema?", a: "Não! O Kond foi desenhado para ser totalmente intuitivo. Em menos de 10 minutos, qualquer profissional de portaria consegue aprender a registrar e entregar encomendas." },
        { q: "O que acontece se a internet da portaria cair?", a: "O sistema web necessita de internet para sincronizar as notificações. Porém, o porteiro poderá acessar normalmente pelo aplicativo 4G no próprio celular." },
        { q: "Os moradores precisam pagar para baixar o app?", a: "Não. O aplicativo do morador (Android e iOS) é 100% gratuito e o acesso ilimitado já está incluso na assinatura padrão do condomínio." },
    ];

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(el => observer.observe(el));

        return () => {
            elements.forEach(el => observer.unobserve(el));
            observer.disconnect();
        };
    }, []);

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="landing-container landing-flex">
                    <div className="landing-logo">
                        <img src={logo} alt="Kond" style={{ height: 40 }} />
                    </div>
                    <div className="landing-menu">
                        <a href="#web-app" className="landing-link">Gestão</a>
                        <a href="#mobile-apps" className="landing-link">Facilidades</a>
                        <a href="#pricing" className="landing-link">Planos</a>
                        <a href="#faq" className="landing-link">FAQ</a>
                    </div>
                    <button className="btn btn-secondary" onClick={handleLogin}>
                        Entrar <ArrowRight size={16} />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-glow" />
                <div className="hero-content animate-on-scroll fade-in-up">
                    <div className="hero-badge">
                        <Zap size={14} />
                        Gestão Inteligente de Encomendas e Acessos
                    </div>
                    <h1 className="hero-title">
                        Simplifique a Logística<br /> do seu Condomínio
                    </h1>
                    <p className="hero-subtitle">
                        Automatize o recebimento, notificação e entrega de encomendas. Mais segurança para a portaria, mais comodidade para os moradores.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn btn-primary btn-lg hover-scale" onClick={() => handleCheckout('pro')}>
                            Começar Agora
                        </button>
                        <button className="btn btn-secondary btn-lg hover-scale" onClick={() => document.getElementById('web-app')?.scrollIntoView({ behavior: 'smooth' })}>
                            Conhecer as Telas
                        </button>
                    </div>
                </div>
            </section>

            {/* Web App Showcase */}
            <section id="web-app" className="section bg-elevated">
                <div className="landing-container">
                    <div className="section-header animate-on-scroll fade-in-up">
                        <div className="flex justify-center mb-md"><Monitor size={48} color="var(--color-primary)" /></div>
                        <h2 className="section-title">Gestão completa para o Síndico e Administração</h2>
                        <p className="section-subtitle">Acesso total e controle gerencial para síndicos e administradoras através de um painel web intuitivo e poderoso.</p>
                    </div>

                    <div className="web-showcase-container">
                        <div className="web-feature-row animate-on-scroll fade-in-up">
                            <div className="web-feature-img">
                                <img src="/site/dashboard-web.png" alt="Dashboard Principal" />
                            </div>
                            <div className="web-feature-text">
                                <h3>Visão Geral e Indicadores</h3>
                                <p>Acompanhe tudo que acontece no condomínio em tempo real através do dashboard central. Visualize gráficos de fluxo de encomendas, pacotes pendentes de retirada, alertas de segurança e atalhos rápidos para as funções mais usadas no dia a dia. Uma central de controle na tela do seu computador.</p>
                            </div>
                        </div>

                        <div className="web-feature-row reverse animate-on-scroll fade-in-up" style={{ transitionDelay: '0.1s' }}>
                            <div className="web-feature-img">
                                <img src="/site/convite-web.png" alt="Gestão de Convites" />
                            </div>
                            <div className="web-feature-text">
                                <h3>Gestão de Convites e Acessos</h3>
                                <p>Controle absoluto sobre quem entra e quem sai. Os convites temporários gerados pelos moradores aparecem organizados em uma lista clara, permitindo o cancelamento a qualquer instante pelas mãos do síndico, garantindo a máxima segurança para a estrutura do condomínio.</p>
                            </div>
                        </div>

                        <div className="web-feature-row animate-on-scroll fade-in-up" style={{ transitionDelay: '0.2s' }}>
                            <div className="web-feature-img">
                                <img src="/site/unidades-web.png" alt="Gestão de Unidades" />
                            </div>
                            <div className="web-feature-text">
                                <h3>Gestão de Unidades e Moradores</h3>
                                <p>Cadastre e altere facilmente informações de blocos, apartamentos e residentes. Mantenha os contatos e vinculações de unidades sempre atualizados com uma interface limpa, dispensando planilhas complexas de Excel.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile Interfaces Showcase */}
            <section id="mobile-apps" className="section">
                <div className="landing-container">
                    <div className="section-header animate-on-scroll fade-in-up">
                        <div className="flex justify-center mb-md"><Smartphone size={48} color="var(--color-primary)" /></div>
                        <h2 className="section-title">O Condomínio na Palma da Mão</h2>
                        <p className="section-subtitle">Desenvolvemos aplicativos nativos incríveis, pensados nas reais necessidades de quem os utiliza todos os dias.</p>
                    </div>

                    {/* App Morador */}
                    <div className="app-showcase section-divider">
                        <div className="app-info animate-on-scroll fade-in-left">
                            <div className="app-badge">App do Morador</div>
                            <h3 className="app-title">Segurança para Quem Mora</h3>
                            <ul className="app-features-list">
                                <li>
                                    <strong>QR Code Expresso:</strong> O QR code facilita e agiliza a verificação na portaria para retirada de encomendas com total segurança.
                                </li>
                                <li>
                                    <strong>Histórico Completo:</strong> Rastreie pacotes antigos ou encomendas pendentes em um histórico organizado mostrando data e hora exatas de chegada.
                                </li>
                                <li>
                                    <strong>Controle de Conta:</strong> Atualize suas configurações, notificações de contato e senha diretamente nas "Configurações" sem depender da portaria.
                                </li>
                            </ul>
                        </div>
                        <div className="app-mockups-grid animate-on-scroll fade-in-right">
                            <img src="/site/morador-qr.jpeg" alt="QR Code Morador" className="app-img primary" />
                            <img src="/site/morador-gerar-qr.jpeg" alt="Gerar Convite" className="app-img secondary s1" />
                            <img src="/site/morador-historico.jpeg" alt="Histórico" className="app-img secondary s2" />
                            <img src="/site/morador-configuracoes.jpeg" alt="Configurações" className="app-img secondary s3" />
                        </div>
                    </div>

                    {/* App Portaria */}
                    <div className="app-showcase reverse mt-2xl">
                        <div className="app-info animate-on-scroll fade-in-right">
                            <div className="app-badge portaria">App da Portaria</div>
                            <h3 className="app-title">Feito para a Rotina do Porteiro</h3>
                            <ul className="app-features-list">
                                <li>
                                    <strong>Foco Total:</strong> Painel em tempo real para controle de encomendas.
                                </li>
                                <li>
                                    <strong>Registro Rápido:</strong> Registre um pacote tirando a foto da nota ou caixa e vinculando-o à unidade com uma pesquisa incrivelmente veloz.
                                </li>
                                <li>
                                    <strong>Segurança:</strong> Confirme a entrega do pacote apenas validando com QR code de morador.
                                </li>
                                <li>
                                    <strong>Simplicidade:</strong> Formulários limpos projetados para que o próprio porteiro inclua encomendas com total autonomia sem depender de um PC.
                                </li>
                            </ul>
                        </div>
                        <div className="app-mockups-grid animate-on-scroll fade-in-left">
                            <img src="/site/porteiro-inicio.jpeg" alt="Início Portaria" className="app-img primary" />
                            <img src="/site/porteiro-nova-encomenda.jpeg" alt="Nova Encomenda" className="app-img secondary s1" />
                            <img src="/site/porteiro-confirmacao-entrega.jpeg" alt="Confirmar Entrega" className="app-img secondary s2" />
                            <img src="/site/porteiro-cadastro.jpeg" alt="Cadastro" className="app-img secondary s3" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="section bg-elevated">
                <div className="landing-container">
                    <div className="section-header animate-on-scroll fade-in-up">
                        <h2 className="section-title">Planos Transparentes</h2>
                        <p className="section-subtitle">
                            Escolha a melhor opção para o tamanho do seu condomínio. Sem taxas escondidas.
                        </p>
                    </div>

                    <div className="pricing-grid">
                        <div className="pricing-card animate-on-scroll slide-in-bottom">
                            <h3 className="pricing-plan">Starter</h3>
                            <div className="pricing-price">R$ 199<span className="pricing-period">/mês</span></div>
                            <p className="text-secondary text-sm mb-lg">Para condomínios pequenos</p>

                            <div className="pricing-features">
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> Até 50 unidades</div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> App para Moradores</div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> App para Portaria</div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> Suporte por Email</div>
                            </div>

                            <button className="btn btn-secondary w-full hover-scale" onClick={() => handleCheckout('starter')}>
                                Assinar Starter
                            </button>
                        </div>

                        <div className="pricing-card pricing-featured animate-on-scroll slide-in-bottom" style={{ transitionDelay: '0.2s' }}>
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

                            <button className="btn btn-primary btn-lg w-full hover-scale" onClick={() => handleCheckout('pro')}>
                                Assinar Pro
                            </button>
                        </div>

                        <div className="pricing-card animate-on-scroll slide-in-bottom" style={{ transitionDelay: '0.4s' }}>
                            <h3 className="pricing-plan">Enterprise</h3>
                            <div className="pricing-price">Sob Consulta</div>
                            <p className="text-secondary text-sm mb-lg">Para administradoras</p>

                            <div className="pricing-features">
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> Múltiplos Condomínios</div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> Painel Centralizado</div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> Integração via API</div>
                                <div className="pricing-feature-item"><Check size={16} color="var(--color-success)" /> Gerente de Conta</div>
                            </div>

                            <button className="btn btn-secondary w-full hover-scale" onClick={() => window.location.href = 'mailto:comercial@kond.com'}>
                                Falar com Consultor
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="section">
                <div className="landing-container">
                    <div className="section-header animate-on-scroll fade-in-up">
                        <h2 className="section-title">O que dizem nossos clientes</h2>
                    </div>

                    <div className="testimonials-grid">
                        <div className="testimonial-card animate-on-scroll fade-in-up">
                            <p className="testimonial-text">"Desde que implantamos o Kond, as reclamações sobre encomendas sumidas acabaram. A portaria ficou muito mais ágil."</p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar">RC</div>
                                <div>
                                    <div className="font-bold">Roberto Carlos</div>
                                    <div className="text-sm text-secondary">Síndico - Ed. Solar</div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card animate-on-scroll fade-in-up" style={{ transitionDelay: '0.1s' }}>
                            <p className="testimonial-text">"O aplicativo é muito fácil de usar. Recebo a notificação no trabalho e já passo na portaria sabendo o que chegou."</p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar">AM</div>
                                <div>
                                    <div className="font-bold">Ana Maria</div>
                                    <div className="text-sm text-secondary">Moradora - Cond. Jardins</div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card animate-on-scroll fade-in-up" style={{ transitionDelay: '0.2s' }}>
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

            {/* FAQ Section */}
            <section id="faq" className="section bg-elevated">
                <div className="landing-container">
                    <div className="section-header animate-on-scroll fade-in-up">
                        <h2 className="section-title">Perguntas Frequentes</h2>
                        <p className="section-subtitle">Tire suas dúvidas e veja como é fácil implantar o Kond.</p>
                    </div>

                    <div className="faq-container animate-on-scroll fade-in-up">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`faq-item ${openFaq === index ? 'open' : ''}`}
                                onClick={() => toggleFaq(index)}
                            >
                                <div className="faq-question">
                                    <h3 className="font-bold">{faq.q}</h3>
                                    {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                                <div className="faq-answer">
                                    <p className="text-secondary">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer animate-on-scroll fade-in">
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
                            <a href="#web-app" className="footer-link">Painel Web</a>
                            <a href="#mobile-apps" className="footer-link">Apps Mobile</a>
                            <a href="#pricing" className="footer-link">Planos</a>
                            <a href="#faq" className="footer-link">FAQ</a>
                        </div>

                        <div className="footer-links">
                            <h4 className="footer-heading">Empresa</h4>
                            <a href="https://www.kavicki.com" target="_blank" rel="noopener noreferrer" className="footer-link">Sobre Nós</a>
                            <button className="footer-link text-left bg-transparent p-0 border-none" onClick={() => setIsContactModalOpen(true)}>Contato</button>
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

            {/* Contact Modal */}
            {isContactModalOpen && (
                <div className="modal-overlay" onClick={() => setIsContactModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Fale Conosco</h3>
                            <button className="modal-close" onClick={() => setIsContactModalOpen(false)}>✕</button>
                        </div>
                        <form className="modal-form" onSubmit={handleContactSubmit}>
                            <div className="form-group">
                                <label>Nome</label>
                                <input type="text" required placeholder="Seu nome completo" />
                            </div>
                            <div className="form-group">
                                <label>E-mail</label>
                                <input type="email" required placeholder="seu@email.com" />
                            </div>
                            <div className="form-group">
                                <label>Mensagem</label>
                                <textarea required rows={4} placeholder="Como podemos ajudar?" />
                            </div>
                            <button type="submit" className="btn btn-primary w-full mt-sm">Enviar Mensagem</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
