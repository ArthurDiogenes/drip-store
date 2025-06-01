import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import styles from './Register.module.css';

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isStoring, setIsStoring] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Por favor, insira um email válido.');
      return;
    }

    if (!password.trim()) {
      setError('Por favor, insira uma senha.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    try {
      setIsStoring(true);

      sessionStorage.setItem('registerEmail', email);
      sessionStorage.setItem('registerPassword', password);

      navigate('/cadastro/formulario');
    } catch (err) {
      console.error('Error storing registration data:', err);
      setError('Houve um erro ao processar seu cadastro. Por favor, tente novamente.');
      setIsStoring(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.registerContainer}>
        <div className={styles.registerCard}>
          <h1 className={styles.registerTitle}>Crie sua conta</h1>
          <p className={styles.loginPrompt}>
            Já possui uma conta? Entre <Link to="/login" className={styles.loginLink}>aqui</Link>.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.registerForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email *</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Insira seu email"
                className={styles.input}
                required
                disabled={isStoring}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Senha *</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Insira sua senha"
                className={styles.input}
                required
                disabled={isStoring}
                minLength="8"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirme sua senha *</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                className={styles.input}
                required
                disabled={isStoring}
              />
            </div>

            <button
              type="submit"
              className={styles.registerButton}
              disabled={isStoring}
            >
              {isStoring ? 'Aguarde...' : 'Continuar'}
            </button>
          </form>

          <div className={styles.socialLogin}>
            <p className={styles.socialText}>Ou faça login com</p>
            <div className={styles.socialButtons}>
              <button className={styles.googleButton} disabled={isStoring}>
                <img src="/icons/gmail.png" alt="Gmail" />
              </button>
              <button className={styles.facebookButton} disabled={isStoring}>
                <img src="/icons/facebook.png" alt="Facebook" />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.productImage}>
          <img src="../images/login-shoes.png" alt="Tênis" />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;