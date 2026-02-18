import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo.png';
import './Checkout.css'; // reuse checkout page styles

type Status = 'loading' | 'success' | 'error';

export default function ConfirmEmail() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<Status>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Supabase automatically processes the token hash from the URL.
        // We listen for the session to be established.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                setStatus('success');
            } else if (event === 'USER_UPDATED' && session) {
                // Also fires on email confirmation
                setStatus('success');
            }
        });

        // Also check if there's already a session (user clicked link in same browser)
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                setErrorMessage(error.message);
                setStatus('error');
            } else if (session) {
                setStatus('success');
            }
        });

        // Handle error in URL hash (e.g. expired link)
        const hash = window.location.hash;
        if (hash.includes('error=')) {
            const params = new URLSearchParams(hash.replace('#', '?'));
            const desc = params.get('error_description') || 'Link inválido ou expirado.';
            setErrorMessage(decodeURIComponent(desc.replace(/\+/g, ' ')));
            setStatus('error');
        }

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="checkout-page">
            <div className="landing-nav" style={{ position: 'absolute' }}>
                <div className="landing-container landing-flex">
                    <div className="landing-logo cursor-pointer" onClick={() => navigate('/')}>
                        <img src={logo} alt="Kond" style={{ height: 40 }} />
                    </div>
                </div>
            </div>

            <div className="checkout-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="checkout-card text-center" style={{ maxWidth: 480 }}>

                    {status === 'loading' && (
                        <>
                            <div className="mb-xl flex justify-center">
                                <div className="spinner spinner-lg" />
                            </div>
                            <h2 className="checkout-title">Confirmando sua conta...</h2>
                            <p className="checkout-subtitle">Aguarde um momento.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
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
                            <h2 className="checkout-title">Email Confirmado!</h2>
                            <p className="checkout-subtitle mb-xl">
                                Sua conta foi verificada com sucesso. Você já está logado e pode acessar o painel agora.
                            </p>
                            <button
                                className="btn btn-primary btn-lg w-full"
                                style={{ marginTop: '1.5rem' }}
                                onClick={() => navigate('/dashboard')}
                            >
                                Acessar o Painel
                            </button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="mb-xl flex justify-center">
                                <div style={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    background: 'rgba(239,68,68,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#ef4444'
                                }}>
                                    <XCircle size={48} />
                                </div>
                            </div>
                            <h2 className="checkout-title">Link Inválido</h2>
                            <p className="checkout-subtitle mb-xl">
                                {errorMessage || 'Este link de confirmação é inválido ou já expirou.'}
                            </p>
                            <button
                                className="btn btn-primary btn-lg w-full"
                                onClick={() => navigate('/login')}
                            >
                                Ir para o Login
                            </button>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
