// src/pages/PaymentMethods/PaymentMethods.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import AccountSidebar from '../../components/AccountSidebar/AccountSidebar';
import { useUser } from '../../contexts/UserContext';
import {
  getUserPaymentMethods,
  setDefaultPaymentMethod,
  removePaymentMethod
} from '../../services/userService';
import styles from './PaymentMethods.module.css';

const PaymentMethods = () => {
  const { user } = useUser();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // For individual card actions

  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const methods = await getUserPaymentMethods(user.id);
        setPaymentMethods(methods);
      } catch (err) {
        console.error('Error loading payment methods:', err);
        setError('Erro ao carregar métodos de pagamento. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentMethods();
  }, [user]);

  const handleSetDefault = async (methodId) => {
    if (!user || actionLoading) return;

    try {
      setActionLoading(methodId);
      setError(null);

      await setDefaultPaymentMethod(user.id, methodId);

      setPaymentMethods(prev =>
        prev.map(method => ({
          ...method,
          padrao: method.id === methodId
        }))
      );

    } catch (err) {
      console.error('Error setting default payment method:', err);
      setError('Erro ao definir cartão como padrão. Tente novamente.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveCard = async (methodId) => {
    if (!user || actionLoading) return;

    if (!window.confirm('Tem certeza que deseja remover este cartão?')) {
      return;
    }

    try {
      setActionLoading(methodId);
      setError(null);

      await removePaymentMethod(user.id, methodId);

      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));

    } catch (err) {
      console.error('Error removing payment method:', err);
      setError('Erro ao remover cartão. Tente novamente.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return 'N/A';

    if (dateString.includes('/')) {
      return dateString;
    }

    if (dateString.includes('-')) {
      const [year, month] = dateString.split('-');
      return `${month}/${year.slice(-2)}`;
    }

    return dateString;
  };

  const getCardBrandDisplay = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return { text: 'VISA', className: styles.visaIcon };
      case 'mastercard':
        return { text: 'MC', className: styles.mastercardIcon };
      case 'amex':
        return { text: 'AMEX', className: styles.amexIcon };
      case 'elo':
        return { text: 'ELO', className: styles.eloIcon };
      default:
        return { text: brand?.toUpperCase() || 'CARD', className: styles.defaultIcon };
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className={styles.pageContainer}>
            <div className={styles.sidebarContainer}>
              <AccountSidebar />
            </div>
            <div className={styles.contentContainer}>
              <div className={styles.headerContainer}>
                <h1 className={styles.pageTitle}>Métodos de Pagamento</h1>
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className={styles.cardsSection}>
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-200 h-20 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className={styles.pageContainer}>
          <div className={styles.sidebarContainer}>
            <AccountSidebar />
          </div>

          <div className={styles.contentContainer}>
            <div className={styles.headerContainer}>
              <h1 className={styles.pageTitle}>Métodos de Pagamento</h1>
              <Link to="/adicionar-cartao" className={styles.addButton}>
                + Adicionar novo cartão
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                {error}
                <button
                  onClick={() => setError(null)}
                  className="ml-2 text-red-800 hover:text-red-900"
                >
                  ✕
                </button>
              </div>
            )}

            <div className={styles.cardsSection}>
              {paymentMethods.length > 0 ? (
                <div className={styles.cardsList}>
                  {paymentMethods.map((card) => {
                    const brandInfo = getCardBrandDisplay(card.bandeira);
                    const isActionLoading = actionLoading === card.id;

                    return (
                      <div key={card.id} className={styles.cardItem}>
                        <div className={styles.cardDetails}>
                          <div className={styles.cardIcon}>
                            <div className={brandInfo.className}>
                              {brandInfo.text}
                            </div>
                          </div>
                          <div className={styles.cardInfo}>
                            <p className={styles.cardNumber}>
                              •••• •••• •••• {card.ultimos_digitos}
                            </p>
                            <p className={styles.cardExpiry}>
                              Válido até {formatExpiryDate(card.data_validade)}
                            </p>
                            <p className={styles.cardHolder}>
                              {card.nome_titular}
                            </p>
                            {card.padrao && (
                              <span className={styles.defaultBadge}>Padrão</span>
                            )}
                          </div>
                        </div>
                        <div className={styles.cardActions}>
                          {!card.padrao && (
                            <button
                              className={styles.setDefaultButton}
                              onClick={() => handleSetDefault(card.id)}
                              disabled={isActionLoading}
                            >
                              {isActionLoading ? 'Definindo...' : 'Definir como padrão'}
                            </button>
                          )}
                          <button
                            className={styles.removeButton}
                            onClick={() => handleRemoveCard(card.id)}
                            disabled={isActionLoading}
                          >
                            {isActionLoading ? 'Removendo...' : 'Remover'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💳</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum cartão cadastrado
                    </h3>
                    <p className={styles.emptyStateSubtext}>
                      Adicione um cartão para finalizar suas compras mais rapidamente.
                    </p>
                    <Link
                      to="/adicionar-cartao"
                      className="mt-4 inline-block bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
                    >
                      Adicionar primeiro cartão
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.infoBox}>
              <h4 className={styles.infoTitle}>Informações sobre segurança</h4>
              <p className={styles.infoText}>
                Seus dados de pagamento são criptografados e armazenados com segurança.
                Nunca compartilhamos suas informações financeiras com terceiros.
                O cartão padrão será usado automaticamente nas suas próximas compras.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentMethods;