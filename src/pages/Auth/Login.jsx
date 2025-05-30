import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, X } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import styles from './Login.module.css';
import { signIn } from '../../services/authService';
import { useUser } from '../../contexts/UserContext';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-white border-l-4 border-green-500 shadow-lg';
      case 'error':
        return 'bg-white border-l-4 border-red-500 shadow-lg';
      default:
        return 'bg-white border-l-4 border-green-500 shadow-lg';
    }
  };

  const toastStyles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    maxWidth: '400px',
    width: '100%',
    transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out',
    borderRadius: '8px',
    overflow: 'hidden'
  };

  return (
    <div style={toastStyles}>
      <div className={getStyles()}>
        <div className="flex items-center p-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-gray-900">
              {message}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { updateUserAndFetchProfile } = useUser();

  const [setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const showToast = (message, type = 'success') => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  const getSpecificErrorMessage = (error) => {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code || '';

    console.log('Login error details:', { errorMessage, errorCode, fullError: error });

    if (errorMessage.includes('invalid login credentials') ||
      errorMessage.includes('invalid credentials') ||
      errorCode === 'invalid_credentials') {
      return 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
    }

    if (errorMessage.includes('email not confirmed') ||
      errorMessage.includes('email_not_confirmed') ||
      errorCode === 'email_not_confirmed') {
      return 'Sua conta ainda não foi confirmada. Verifique seu email e clique no link de confirmação enviado durante o cadastro.';
    }

    if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
      return 'Email inválido. Verifique se o formato do email está correto.';
    }

    if (errorMessage.includes('password') && errorMessage.includes('invalid')) {
      return 'Senha incorreta. Verifique sua senha e tente novamente.';
    }

    if (errorMessage.includes('user not found') ||
      errorMessage.includes('user_not_found')) {
      return 'Não encontramos uma conta com este email. Verifique o email ou cadastre-se.';
    }

    if (errorMessage.includes('too many requests') ||
      errorMessage.includes('rate limit')) {
      return 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.';
    }

    if (errorMessage.includes('network') ||
      errorMessage.includes('connection')) {
      return 'Problema de conexão. Verifique sua internet e tente novamente.';
    }

    if (errorMessage.includes('signup disabled') ||
      errorMessage.includes('signups not allowed')) {
      return 'Cadastros temporariamente desabilitados. Tente novamente mais tarde.';
    }

    return 'Erro ao fazer login. Verifique suas credenciais e tente novamente.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Por favor, insira seu email.');
      return;
    }

    if (!password.trim()) {
      setError('Por favor, insira sua senha.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor, insira um email válido.');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await signIn(email.trim().toLowerCase(), password);

      if (data && data.user) {
        await updateUserAndFetchProfile(data.user);

        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setError('Ocorreu um erro inesperado durante o login.');
      }
    } catch (err) {
      console.error('Login error:', err);
      const specificError = getSpecificErrorMessage(err);
      setError(specificError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1 className={styles.loginTitle}>Acesse sua conta</h1>
          <p className={styles.registerPrompt}>
            Novo cliente? Então registre-se <Link to="/cadastro" className={styles.registerLink}>aqui</Link>.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 text-sm">
              <div className="flex items-start">
                <X className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p>{error}</p>
                  {error.includes('não foi confirmada') && (
                    <p className="mt-2 text-xs text-red-600">
                      Não recebeu o email? <button className="underline hover:no-underline" onClick={() => showToast('Funcionalidade de reenvio será implementada em breve', 'info')}>Reenviar confirmação</button>
                    </p>
                  )}
                  {error.includes('Não encontramos uma conta') && (
                    <p className="mt-2 text-xs text-red-600">
                      <Link to="/cadastro" className="underline hover:no-underline">Cadastre-se aqui</Link>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.loginForm} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Insira seu email"
                className={styles.input}
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Insira sua senha"
                className={styles.input}
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>

            <div className={styles.forgotPassword}>
              <Link to="/esqueci-senha">Esqueci minha senha</Link>
            </div>

            <button
              type="submit"
              className={styles.loginButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Aguarde...' : 'Acessar Conta'}
            </button>
          </form>

          <div className={styles.socialLogin}>
            <p className={styles.socialText}>Ou faça login com</p>
            <div className={styles.socialButtons}>
              <button className={styles.googleButton} disabled={isSubmitting}>
                <img src="/icons/gmail.png" alt="Gmail" />
              </button>
              <button className={styles.facebookButton} disabled={isSubmitting}>
                <img src="/icons/facebook.png" alt="Facebook" />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.productImage}>
          <img src="/images/login-shoes.png" alt="Tênis" />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;