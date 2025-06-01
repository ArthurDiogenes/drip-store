import { supabase } from './supabase';

export const validateCoupon = async (couponCode, cartTotal) => {
  try {
    console.log('Validating coupon:', couponCode, 'for cart total:', cartTotal);
    
    const { data: coupon, error } = await supabase
      .from('cupons')
      .select('*')
      .eq('codigo', couponCode.toUpperCase())
      .eq('ativo', true)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Cupom não encontrado ou inválido.');
      }
      throw error;
    }
    
    const now = new Date();
    const startDate = new Date(coupon.data_inicio);
    const endDate = new Date(coupon.data_expiracao);
    
    if (now < startDate) {
      throw new Error('Este cupom ainda não está ativo.');
    }
    
    if (now > endDate) {
      throw new Error('Este cupom expirou.');
    }
    
    if (coupon.valor_minimo && cartTotal < coupon.valor_minimo) {
      throw new Error(`Pedido mínimo de R$ ${coupon.valor_minimo.toFixed(2).replace('.', ',')} para usar este cupom.`);
    }
    
    if (coupon.usos_maximos && coupon.usos_atuais >= coupon.usos_maximos) {
      throw new Error('Este cupom atingiu o limite de uso.');
    }
    
    let discountValue = 0;
    
    switch (coupon.tipo) {
      case 'Percentual':
        discountValue = (cartTotal * coupon.valor) / 100;
        break;
      case 'Valor Fixo':
        discountValue = coupon.valor;
        break;
      case 'Frete Grátis':
        discountValue = 0;
        break;
      default:
        throw new Error('Tipo de cupom inválido.');
    }
    
    discountValue = Math.min(discountValue, cartTotal);
    
    return {
      isValid: true,
      coupon: {
        id: coupon.id,
        code: coupon.codigo,
        type: coupon.tipo,
        value: coupon.valor,
        discountValue: discountValue,
        freeShipping: coupon.tipo === 'Frete Grátis'
      },
      message: `Cupom aplicado! Desconto de R$ ${discountValue.toFixed(2).replace('.', ',')}`
    };
    
  } catch (error) {
    console.error('Error validating coupon:', error);
    return {
      isValid: false,
      error: error.message || 'Erro ao validar cupom.'
    };
  }
};

export const applyCoupon = async (couponId) => {
  try {
    const { error } = await supabase.rpc('incrementar_uso_cupom', {
      p_coupon_id: couponId
    });
    
    if (error) throw error;
    return true;
    
  } catch (error) {
    console.error('Error applying coupon:', error);
    return false;
  }
};

export const getAvailableCoupons = async () => {
  try {
    const { data, error } = await supabase
      .from('cupons')
      .select('codigo, tipo, valor, valor_minimo, data_expiracao')
      .eq('ativo', true)
      .gte('data_expiracao', new Date().toISOString())
      .order('data_expiracao', { ascending: true });
    
    if (error) throw error;
    return data || [];
    
  } catch (error) {
    console.error('Error getting available coupons:', error);
    return [];
  }
};