import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn, session } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (session) {
            navigate('/dashboard', { replace: true });
        }
    }, [session, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await signIn(email, password);
            if (error) throw error;
        } catch (err: any) {
            setError('Email ou senha inválidos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <img src={logo} alt="Kond" style={{ height: 48, marginBottom: 16 }} />
                    </div>
                    <h1 className="login-title">Bem-vindo de volta</h1>
                    <p className="login-subtitle">Acesse o painel do seu condomínio</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="login-error">{error}</div>}

                    <div className="form-group">
                        <label className="input-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            className="input"
                            type="email"
                            placeholder="admin@condominio.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="input-label" htmlFor="password">Senha</label>
                        <input
                            id="password"
                            className="input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? <div className="spinner" /> : 'Entrar'}
                    </button>
                </form>

                <p className="login-footer">
                    Acesso exclusivo para administradores de condomínio
                </p>
            </div>

            {/* Background decoration */}
            <div className="login-bg">
                <div className="login-bg-gradient" />
                <div className="login-bg-grid" />
            </div>
        </div>
    );
}
