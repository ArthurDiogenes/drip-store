import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import AccountSidebar from '../../components/AccountSidebar/AccountSidebar';
import { useUser } from '../../contexts/UserContext';
import { getUserProfile, updateUserProfile } from '../../services/userService';
import styles from './EditUserInfo.module.css';

const EditUserInfo = () => {
  const { user, profile, setProfile } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    celular: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    complemento: '',
    receber_ofertas: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let profileData = profile;

        if (!profileData) {
          profileData = await getUserProfile(user.id);
        }

        if (profileData) {
          setFormData({
            nome_completo: profileData.nome_completo || '',
            cpf: profileData.cpf || '',
            celular: profileData.celular || '',
            endereco: profileData.endereco || '',
            bairro: profileData.bairro || '',
            cidade: profileData.cidade || '',
            estado: profileData.estado || '',
            cep: profileData.cep || '',
            complemento: profileData.complemento || '',
            receber_ofertas: profileData.receber_ofertas || false
          });
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Erro ao carregar informações do usuário.');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user, profile, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatCPF = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 3) {
      return numericValue;
    } else if (numericValue.length <= 6) {
      return `${numericValue.slice(0, 3)}.${numericValue.slice(3)}`;
    } else if (numericValue.length <= 9) {
      return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6)}`;
    } else {
      return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6, 9)}-${numericValue.slice(9, 11)}`;
    }
  };

  const formatPhone = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 2) {
      return numericValue.length ? `(${numericValue}` : '';
    } else if (numericValue.length <= 7) {
      return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`;
    } else {
      return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7, 11)}`;
    }
  };

  const formatCEP = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 5) {
      return numericValue;
    } else {
      return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
    }
  };

  const handleFormattedInput = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'celular') {
      formattedValue = formatPhone(value);
    } else if (name === 'cep') {
      formattedValue = formatCEP(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;

    setError(null);
    setSuccess(false);

    const requiredFields = ['nome_completo', 'cpf', 'celular', 'endereco', 'bairro', 'cidade', 'estado', 'cep'];
    for (const field of requiredFields) {
      if (!formData[field] || !formData[field].toString().trim()) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
    }

    const cpfNumbers = formData.cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      setError('CPF deve ter 11 dígitos.');
      return;
    }

    const phoneNumbers = formData.celular.replace(/\D/g, '');
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      setError('Número de celular inválido.');
      return;
    }

    const cepNumbers = formData.cep.replace(/\D/g, '');
    if (cepNumbers.length !== 8) {
      setError('CEP deve ter 8 dígitos.');
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        nome_completo: formData.nome_completo.trim(),
        cpf: formData.cpf.replace(/\D/g, ''),
        celular: formData.celular.replace(/\D/g, ''),
        endereco: formData.endereco.trim(),
        bairro: formData.bairro.trim(),
        cidade: formData.cidade.trim(),
        estado: formData.estado.trim(),
        cep: formData.cep.replace(/\D/g, ''),
        complemento: formData.complemento?.trim() || null,
        receber_ofertas: formData.receber_ofertas
      };

      await updateUserProfile(user.id, updateData);

      setProfile({ ...updateData, id: user.id });

      setSuccess(true);

      setTimeout(() => {
        navigate('/minhas-informacoes');
      }, 2000);

    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Erro ao atualizar informações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className={styles.editUserInfoPage}>
            <div className={styles.sidebarContainer}>
              <AccountSidebar />
            </div>
            <div className={styles.contentContainer}>
              <h1 className={styles.pageTitle}>Editar Informações</h1>
              <div className="animate-pulse bg-white rounded-md p-6">
                <div className="space-y-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
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
        <div className={styles.editUserInfoPage}>
          <div className={styles.sidebarContainer}>
            <AccountSidebar />
          </div>

          <div className={styles.contentContainer}>
            <h1 className={styles.pageTitle}>Editar Informações</h1>

            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">
                Informações atualizadas com sucesso! Redirecionando...
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}

            <div className={styles.formCard}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Informações Pessoais</h2>
                  <div className={styles.separator}></div>

                  <div className={styles.formGroup}>
                    <label htmlFor="nome_completo" className={styles.label}>
                      Nome Completo <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="nome_completo"
                      name="nome_completo"
                      value={formData.nome_completo}
                      onChange={handleChange}
                      className={styles.input}
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="cpf" className={styles.label}>
                      CPF <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleFormattedInput}
                      className={styles.input}
                      maxLength="14"
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>
                      E-mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ''}
                      className={styles.input}
                      disabled={true}
                      title="O email não pode ser alterado"
                    />
                    <p className={styles.helpText}>
                      O email não pode ser alterado após o cadastro.
                    </p>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="celular" className={styles.label}>
                      Celular <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="celular"
                      name="celular"
                      value={formData.celular}
                      onChange={handleFormattedInput}
                      className={styles.input}
                      maxLength="16"
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Informações de Entrega</h2>
                  <div className={styles.separator}></div>

                  <div className={styles.formGroup}>
                    <label htmlFor="endereco" className={styles.label}>
                      Endereço <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="endereco"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleChange}
                      className={styles.input}
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="bairro" className={styles.label}>
                      Bairro <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="bairro"
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleChange}
                      className={styles.input}
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="cidade" className={styles.label}>
                      Cidade <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      className={styles.input}
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="estado" className={styles.label}>
                      Estado <span className={styles.required}>*</span>
                    </label>
                    <select
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className={styles.input}
                      required
                      disabled={saving}
                    >
                      <option value="">Selecione</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="cep" className={styles.label}>
                      CEP <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="cep"
                      name="cep"
                      value={formData.cep}
                      onChange={handleFormattedInput}
                      className={styles.input}
                      maxLength="9"
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="complemento" className={styles.label}>
                      Complemento
                    </label>
                    <input
                      type="text"
                      id="complemento"
                      name="complemento"
                      value={formData.complemento}
                      onChange={handleChange}
                      className={styles.input}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Preferências</h2>
                  <div className={styles.separator}></div>

                  <div className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id="receber_ofertas"
                      name="receber_ofertas"
                      checked={formData.receber_ofertas}
                      onChange={handleChange}
                      className={styles.checkbox}
                      disabled={saving}
                    />
                    <label htmlFor="receber_ofertas" className={styles.checkboxLabel}>
                      Quero receber por email ofertas e novidades das lojas da Digital Store
                    </label>
                  </div>
                </div>

                <div className={styles.actionButtons}>
                  <button
                    type="button"
                    onClick={() => navigate('/minhas-informacoes')}
                    className={styles.cancelButton}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={saving}
                  >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
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

export default EditUserInfo;