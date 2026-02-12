import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
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

            <h1 className="text-3xl font-bold text-primary mb-lg">Termos de Uso</h1>
            <p className="text-sm text-muted mb-xl">Última atualização: {new Date().toLocaleDateString()}</p>

            <div className="prose">
                <section className="mb-lg">
                    <h2 className="text-xl font-bold text-primary mb-md">1. Aceitação dos Termos</h2>
                    <p className="mb-md">
                        Ao acessar e utilizar a plataforma Kond, você aceita e concorda em estar vinculado aos termos e disposições deste acordo. Além disso, ao utilizar os serviços específicos deste aplicativo, você estará sujeito a quaisquer regras ou diretrizes publicadas aplicáveis a tais serviços.
                    </p>
                </section>

                <section className="mb-lg">
                    <h2 className="text-xl font-bold text-primary mb-md">2. Descrição do Serviço</h2>
                    <p className="mb-md">
                        O Kond fornece uma plataforma de gestão de encomendas para condomínios, permitindo o registro, notificação e controle de entrega de pacotes. O serviço é fornecido "como está" e o Kond não assume responsabilidade pela pontualidade, exclusão, entrega incorreta ou falha no armazenamento de qualquer comunicação ou configuração de personalização do usuário.
                    </p>
                </section>

                <section className="mb-lg">
                    <h2 className="text-xl font-bold text-primary mb-md">3. Cadastro e Segurança</h2>
                    <p className="mb-md">
                        Para utilizar o serviço, você deve fornecer informações verdadeiras, exatas, atuais e completas sobre si mesmo e seu condomínio. Você é responsável por manter a confidencialidade de sua senha e conta, sendo totalmente responsável por todas as atividades que ocorram sob sua senha ou conta.
                    </p>
                </section>

                <section className="mb-lg">
                    <h2 className="text-xl font-bold text-primary mb-md">4. Pagamentos e Assinaturas</h2>
                    <p className="mb-md">
                        O serviço é oferecido mediante assinatura (mensal ou anual). Os pagamentos são processados de forma segura. O cancelamento pode ser feito a qualquer momento, sem multa, respeitando o período de vigência já pago.
                    </p>
                </section>

                <section className="mb-lg">
                    <h2 className="text-xl font-bold text-primary mb-md">5. Modificações</h2>
                    <p className="mb-md">
                        Reservamo-nos o direito de modificar ou descontinuar, temporária ou permanentemente, o serviço (ou qualquer parte dele) com ou sem aviso prévio. Você concorda que o Kond não será responsável perante você ou terceiros por qualquer modificação, suspensão ou descontinuação do serviço.
                    </p>
                </section>
            </div>
        </div>
    );
}
