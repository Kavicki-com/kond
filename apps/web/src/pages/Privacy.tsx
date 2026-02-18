import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: 'var(--color-text-secondary)' }}>
            <button
                onClick={() => navigate('/')}
                className="btn btn-ghost mb-lg"
                style={{ paddingLeft: 0 }}
            >
                <ArrowLeft size={20} /> Voltar
            </button>

            <h1 className="text-3xl font-bold text-primary mb-lg">Política de Privacidade</h1>
            <p className="text-sm text-muted mb-xl">Última atualização: {new Date().toLocaleDateString()}</p>

            <div className="prose">
                <section className="mb-lg">
                    <h2 className="text-xl font-bold text-primary mb-md">1. Coleta de Informações</h2>
                    <p className="mb-md">
                        Coletamos informações para fornecer melhores serviços a todos os nossos usuários. As informações coletadas incluem:
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
                        <li>Informações de cadastro (Nome, Email, Telefone);</li>
                        <li>Dados do condomínio e unidades;</li>
                        <li>Registros de encomendas (incluindo fotos e dados do destinatário);</li>
                        <li>Logs de acesso e uso do sistema.</li>
                    </ul>
                </section>

                <section className="mb-lg">
                    <h2 className="text-xl font-bold text-primary mb-md">2. Uso das Informações</h2>
                    <p className="mb-md">
                        As informações coletadas são utilizadas para:
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
                        <li>Operar e manter o serviço;</li>
                        <li>Melhorar a experiência do usuário;</li>
                        <li>Enviar notificações sobre encomendas (propósito central do app);</li>
                        <li>Comunicação sobre atualizações, segurança e suporte.</li>
                    </ul>
                </section>

                <section className="mb-lg">
                    <h2 className="text-xl font-bold text-primary mb-md">3. Compartilhamento de Dados</h2>
                    <p className="mb-md">
                        Não compartilhamos informações pessoais com empresas, organizações e indivíduos externos ao Kond, exceto nas seguintes circunstâncias:
                        Com sua autorização; Para processamento externo (ex: processamento de pagamentos); Por motivos legais.
                    </p>
                </section>

                <section className="mb-lg">
                    <h2 className="text-xl font-bold text-primary mb-md">4. Segurança dos Dados</h2>
                    <p className="mb-md">
                        Trabalhamos com rigor para proteger o Kond e nossos usuários de acesso não autorizado, alteração, divulgação ou destruição das informações que detemos. Utilizamos criptografia, autenticação forte e práticas seguras de desenvolvimento.
                    </p>
                </section>
            </div>
        </div>
    );
}
