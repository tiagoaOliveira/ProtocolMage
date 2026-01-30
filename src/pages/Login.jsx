import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [nome, setNome] = useState('');

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                // Validação da confirmação de senha
                if (password !== confirmPassword) {
                    setError('As senhas não coincidem');
                    setLoading(false);
                    return;
                }
                
                await signUp(email, password, nome);
                setError('Cadastro realizado! Verifique seu e-mail para confirmar.');
            } else {
                await signIn(email, password);
                navigate('/home');
            }
        } catch (err) {
            setError(err.message || `Erro ao ${isSignUp ? 'cadastrar' : 'fazer login'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">{isSignUp ? 'Criar Conta' : 'Bem-vindo'}</h1>

                {isSignUp && (
                    <div className="form-group">
                        <label htmlFor="nome">Nome</label>
                        <input
                            id="nome"
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Aparecerá para outros jogadores"
                        />
                    </div>
                )}

                <div className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="seu@email.com"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="••••••••"
                            disabled={loading}
                        />
                    </div>

                    {isSignUp && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Senha</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="••••••••"
                                disabled={loading}
                            />
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    <button
                        onClick={handleSubmit}
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Carregando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
                    </button>

                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                            setConfirmPassword('');
                        }}
                        className="toggle-button"
                        type="button"
                    >
                        {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;