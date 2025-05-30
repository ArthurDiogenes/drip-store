import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import AccountSidebar from '../../components/AccountSidebar/AccountSidebar';
import UserInfoSection from '../../components/UserInfoSection/UserInfoSection';
import UserInfoItem from '../../components/UserInfoItem/UserInfoItem';
import { useUser } from '../../contexts/UserContext';
import { getUserProfile } from '../../services/authService';
import styles from './UserInfo.module.css';

const UserInfo = () => {
  const { user, profile, loading: userLoading } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (profile) {
          setUserProfile(profile);
        } else {
          const profileData = await getUserProfile(user.id);
          if (profileData) {
            setUserProfile(profileData);
          } else {
            setError('Perfil do usuário não encontrado.');
          }
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Erro ao carregar informações do usuário. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user, profile]);

  const formatCPF = (cpf) => {
    if (!cpf) return 'Não informado';
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone) => {
    if (!phone) return 'Não informado';
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const formatCEP = (cep) => {
    if (!cep) return 'Não informado';
    const numbers = cep.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const EditButton = () => (
    <Link to="/editar-informacoes" className={styles.editButton}>
      Editar
    </Link>
  );

  if (userLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className={styles.userInfoPage}>
            <div className={styles.sidebarContainer}>
              <AccountSidebar />
            </div>
            <div className={styles.contentContainer}>
              <h1 className={styles.pageTitle}>Minhas Informações</h1>
              <div className="animate-pulse space-y-6">
                <div className="bg-white rounded-md p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="bg-white rounded-md p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className={styles.userInfoPage}>
            <div className={styles.sidebarContainer}>
              <AccountSidebar />
            </div>
            <div className={styles.contentContainer}>
              <h1 className={styles.pageTitle}>Minhas Informações</h1>
              <div className="bg-white rounded-md p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!userProfile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className={styles.userInfoPage}>
            <div className={styles.sidebarContainer}>
              <AccountSidebar />
            </div>
            <div className={styles.contentContainer}>
              <h1 className={styles.pageTitle}>Minhas Informações</h1>
              <div className="bg-white rounded-md p-8 text-center">
                <p className="text-gray-500 mb-4">
                  Nenhuma informação de perfil encontrada.
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Complete seu perfil para uma melhor experiência de compra.
                </p>
                <Link
                  to="/editar-informacoes"
                  className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors inline-block"
                >
                  Completar Perfil
                </Link>
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
        <div className={styles.userInfoPage}>
          <div className={styles.sidebarContainer}>
            <AccountSidebar />
          </div>

          <div className={styles.contentContainer}>
            <h1 className={styles.pageTitle}>Minhas Informações</h1>

            <UserInfoSection
              title="Informações Pessoais"
              actionButton={<EditButton />}
            >
              <UserInfoItem
                label="Nome"
                value={userProfile.nome_completo || 'Não informado'}
              />
              <UserInfoItem
                label="CPF"
                value={formatCPF(userProfile.cpf)}
              />
              <UserInfoItem
                label="Email"
                value={user?.email || 'Não informado'}
              />
              <UserInfoItem
                label="Celular"
                value={formatPhone(userProfile.celular)}
              />
            </UserInfoSection>

            <UserInfoSection
              title="Informações de Entrega"
              actionButton={<EditButton />}
            >
              <UserInfoItem
                label="Endereço"
                value={userProfile.endereco || 'Não informado'}
              />
              <UserInfoItem
                label="Bairro"
                value={userProfile.bairro || 'Não informado'}
              />
              <UserInfoItem
                label="Cidade"
                value={userProfile.cidade && userProfile.estado
                  ? `${userProfile.cidade}, ${userProfile.estado}`
                  : 'Não informado'
                }
              />
              <UserInfoItem
                label="CEP"
                value={formatCEP(userProfile.cep)}
              />
              {userProfile.complemento && (
                <UserInfoItem
                  label="Complemento"
                  value={userProfile.complemento}
                />
              )}
            </UserInfoSection>

            <UserInfoSection
              title="Preferências de Marketing"
              actionButton={<EditButton />}
            >
              <UserInfoItem
                label="Receber ofertas"
                value={userProfile.receber_ofertas ? 'Sim' : 'Não'}
              />
            </UserInfoSection>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserInfo;