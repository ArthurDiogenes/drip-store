// src/pages/AddPaymentMethod/AddPaymentMethod.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import AccountSidebar from '../../components/AccountSidebar/AccountSidebar';
import { useUser } from '../../contexts/UserContext';
import { addPaymentMethod } from '../../services/userService';
import styles from './AddPaymentMethod.module.css';

const AddPaymentMethod = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tipo: 'Cartão de Crédito',
    bandeira: '',
    numero: '',
    nome_titular: '',
    data_validade: '',
    cvv: ''
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    const numericValue = value.replace(/\D/g, '');
    const groups = numericValue.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19);
  };

  const formatExpiryDate = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length >= 2) {
      return `${numericValue.substr(0, 2)}/${numericValue.substr(2, 2)}`;
    }
    return numericValue;
  };

  const formatCVV = (value) => {
    return value.replace(/\D/g, '').substr(0, 4);
  };

  const handleFormattedInput = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'numero') {
      formattedValue = formatCardNumber(value);
      const numericValue = value.replace(/\D/g, '');
      const cardBrand = detectCardBrand(numericValue);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue,
        bandeira: cardBrand
      }));
      return;
    } else if (name === 'data_validade') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = formatCVV(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const detectCardBrand = (number) => {
    const cleanNumber = number.replace(/\s/g, '');

    if (cleanNumber.startsWith('4')) return 'Visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'Mastercard';
    if (cleanNumber.startsWith('34') || cleanNumber.startsWith('37')) return 'Amex';
    if (cleanNumber.startsWith('6')) return 'Elo';

    if (cleanNumber.length >= 4) return 'Visa';

    return '';
  };

  const validateCardNumber = (number) => {
    const numericNumber = number.replace(/\D/g, '');
    return numericNumber.length >= 13 && numericNumber.length <= 19;
  };

  const validateExpiryDate = (dateString) => {
    if (!dateString.includes('/')) return false;

    const [month, year] = dateString.split('/');
    const monthNum = parseInt(month);
    const yearNum = parseInt(`20${year}`);

    if (monthNum < 1 || monthNum > 12) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;

    setError(null);

    if (!validateCardNumber(formData.numero)) {
      setError('Número do cartão deve ter entre 13 e 19 dígitos.');
      return;
    }

    if (!validateExpiryDate(formData.data_validade)) {
      setError('Data de validade inválida.');
      return;
    }

    const cvvLength = formData.bandeira === 'Amex' ? 4 : 3;
    if (formData.cvv.length !== cvvLength) {
      setError(`CVV deve ter ${cvvLength} dígitos.`);
      return;
    }

    if (!formData.nome_titular.trim()) {
      setError('Nome do titular é obrigatório.');
      return;
    }

    try {
      setLoading(true);

      const cardData = {
        tipo: formData.tipo,
        bandeira: formData.bandeira,
        ultimos_digitos: formData.numero.replace(/\D/g, '').slice(-4),
        data_validade: formData.data_validade,
        nome_titular: formData.nome_titular.trim().toUpperCase()
      };

      await addPaymentMethod(user.id, cardData);

      navigate('/metodos-pagamento');

    } catch (err) {
      console.error('Error adding payment method:', err);
      setError('Erro ao adicionar cartão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className={styles.addPaymentPage}>
          <div className={styles.sidebarContainer}>
            <AccountSidebar />
          </div>

          <div className={styles.contentContainer}>
            <div className={styles.headerContainer}>
              <h1 className={styles.pageTitle}>Adicionar Cartão</h1>
              <button
                onClick={() => navigate('/metodos-pagamento')}
                className={styles.backButton}
              >
                ← Voltar
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}

            <div className={styles.formCard}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="tipo" className={styles.label}>
                    Tipo de Cartão <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className={styles.input}
                    required
                    disabled={loading}
                  >
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Débito">Cartão de Débito</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="numero" className={styles.label}>
                    Número do Cartão <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.cardNumberContainer}>
                    <input
                      type="text"
                      id="numero"
                      name="numero"
                      value={formData.numero}
                      onChange={handleFormattedInput}
                      placeholder="0000 0000 0000 0000"
                      className={styles.input}
                      maxLength="19"
                      required
                      disabled={loading}
                    />
                    {formData.bandeira && (
                      <div className={styles.cardBrandIndicator}>
                        {formData.bandeira}
                      </div>
                    )}
                  </div>
                  <p className={styles.helpText}>
                    💡 Para testes: Visa (4111 1111 1111 1111), Mastercard (5555 5555 5555 4444)
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="nome_titular" className={styles.label}>
                    Nome do Titular <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="nome_titular"
                    name="nome_titular"
                    value={formData.nome_titular}
                    onChange={handleChange}
                    placeholder="Nome como impresso no cartão"
                    className={styles.input}
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="data_validade" className={styles.label}>
                      Validade <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="data_validade"
                      name="data_validade"
                      value={formData.data_validade}
                      onChange={handleFormattedInput}
                      placeholder="MM/AA"
                      className={styles.input}
                      maxLength="5"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="cvv" className={styles.label}>
                      CVV <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleFormattedInput}
                      placeholder={formData.bandeira === 'Amex' ? '0000' : '000'}
                      className={styles.input}
                      maxLength={formData.bandeira === 'Amex' ? '4' : '3'}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className={styles.securityNotice}>
                  <div className="flex items-start gap-3">
                    <div className="text-green-600 mt-1">🔒</div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <strong>Segurança garantida:</strong> Seus dados são criptografados e protegidos.
                        Não armazenamos o número completo do cartão nem o CVV.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.actionButtons}>
                  <button
                    type="button"
                    onClick={() => navigate('/metodos-pagamento')}
                    className={styles.cancelButton}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={loading}
                  >
                    {loading ? 'Adicionando...' : 'Adicionar Cartão'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddPaymentMethod;