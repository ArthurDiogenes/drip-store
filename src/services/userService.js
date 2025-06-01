import { supabase } from './supabase';

export const getUserPaymentMethods = async (userId) => {
  const { data, error } = await supabase
    .from('metodos_pagamento_usuario')
    .select('*')
    .eq('usuario_id', userId)
    .order('padrao', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const addPaymentMethod = async (userId, paymentData) => {
  const { data: existingCards } = await supabase
    .from('metodos_pagamento_usuario')
    .select('id')
    .eq('usuario_id', userId);
  
  const isFirstCard = !existingCards || existingCards.length === 0;
  
  const { data, error } = await supabase
    .from('metodos_pagamento_usuario')
    .insert({
      usuario_id: userId,
      tipo: paymentData.tipo,
      bandeira: paymentData.bandeira,
      ultimos_digitos: paymentData.ultimos_digitos,
      data_validade: paymentData.data_validade,
      nome_titular: paymentData.nome_titular,
      padrao: isFirstCard ? true : false
    })
    .select();

  if (error) throw error;
  return data;
};

export const setDefaultPaymentMethod = async (userId, methodId) => {
  const { error: updateError } = await supabase
    .from('metodos_pagamento_usuario')
    .update({ padrao: false })
    .eq('usuario_id', userId);
  
  if (updateError) throw updateError;
  
  const { data, error } = await supabase
    .from('metodos_pagamento_usuario')
    .update({ padrao: true })
    .eq('id', methodId)
    .eq('usuario_id', userId)
    .select();

  if (error) throw error;
  return data;
};

export const removePaymentMethod = async (userId, methodId) => {
  const { error } = await supabase
    .from('metodos_pagamento_usuario')
    .delete()
    .eq('id', methodId)
    .eq('usuario_id', userId);

  if (error) throw error;
  return true;
};

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

export const updateUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('perfil_usuario')
      .update({
        nome_completo: profileData.nome_completo,
        cpf: profileData.cpf,
        celular: profileData.celular,
        endereco: profileData.endereco,
        bairro: profileData.bairro,
        cidade: profileData.cidade,
        estado: profileData.estado,
        cep: profileData.cep,
        complemento: profileData.complemento,
        receber_ofertas: profileData.receber_ofertas
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('updateUserProfile error:', error);
    throw new Error('Erro ao atualizar perfil do usuário.');
  }
};