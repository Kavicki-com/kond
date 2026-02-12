import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export default function Login() {
    const { signIn, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError('Preencha email e senha.');
            return;
        }

        setLoading(true);
        setError('');

        const { error: signInError } = await signIn(email.trim(), password);
        setLoading(false);

        if (signInError) {
            setError(signInError.message);
        } else {
            navigate('/', { replace: true });
        }
    };

    if (authLoading) {
        return (
            <div className="login-page">
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <span className="login-logo">📦</span>
                    <h1 className="login-title">Kond</h1>
                    <p className="login-subtitle">Painel Administrativo</p>
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
