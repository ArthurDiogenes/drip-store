import { supabase } from './supabase';

/**
 * Register a new user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {Object} userData - Additional user profile data
 * @returns {Promise<Object>} The created user and session
 */
export const signUp = async (email, password, userData) => {
  try {
    console.log('Starting signup process for:', email);
    console.log('User data:', { ...userData, cpf: userData.cpf ? '[HIDDEN]' : undefined });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      throw authError;
    }

    console.log('Auth signup successful:', authData);

    if (authData?.user) {
      try {
        const profileData = {
          id: authData.user.id,
          nome_completo: userData.nome?.trim(),
          cpf: userData.cpf?.replace(/\D/g, ''),
          celular: userData.celular?.replace(/\D/g, ''),
          endereco: userData.endereco?.trim(),
          bairro: userData.bairro?.trim(),
          cidade: userData.cidade?.trim(),
          estado: userData.estado?.trim(),
          cep: userData.cep?.replace(/\D/g, ''),
          complemento: userData.complemento?.trim() || null,
          receber_ofertas: userData.receberOfertas || false
        };

        console.log('Creating profile with data:', { ...profileData, cpf: '[HIDDEN]' });

        const { data: profileResult, error: profileError } = await supabase
          .from('perfil_usuario')
          .insert(profileData)
          .select()
          .single();

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          console.warn('Profile creation failed, but authentication succeeded');
        } else {
          console.log('Profile created successfully:', profileResult);
        }
      } catch (profileError) {
        console.error('Exception creating user profile:', profileError);
      }
    }

    return {
      user: authData?.user || null,
      session: authData?.session || null
    };
  } catch (error) {
    console.error('SignUp error:', error);
    
    if (error.message?.includes('Invalid email')) {
      throw new Error('Email inválido. Por favor, verifique o formato do email.');
    } else if (error.message?.includes('Password')) {
      throw new Error('Senha deve ter pelo menos 6 caracteres.');
    } else if (error.message?.includes('already registered')) {
      throw new Error('Este email já está registrado. Tente fazer login ou use outro email.');
    } else {
      throw new Error(error.message || 'Erro ao criar conta. Tente novamente.');
    }
  }
};

/**
 * Sign in a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} The authenticated user and session
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('SignIn error:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get the current logged-in user
 * @returns {Promise<Object|null>} The current user or null if not logged in
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    return data?.user || null;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
};

/**
 * Get the user profile data
 * @param {string} userId - The user ID to get the profile for
 * @returns {Promise<Object|null>} The user profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('perfil_usuario')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('getUserProfile error:', error);
    return null;
  }
};