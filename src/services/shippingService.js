const validateCEP = (cep) => {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
};

export const calculateShipping = async (cep, cartTotal, hasFreeShipping = false) => {
  try {
    console.log('Calculating shipping for CEP:', cep, 'Cart total:', cartTotal);

    if (!validateCEP(cep)) {
      throw new Error('CEP inválido. Digite um CEP válido com 8 dígitos.');
    }

    if (hasFreeShipping) {
      return {
        success: true,
        options: [
          {
            name: 'Frete Grátis (Cupom)',
            price: 0,
            deliveryTime: '5-7 dias úteis',
            description: 'Entrega gratuita por cupom de desconto'
          }
        ]
      };
    }

    if (cartTotal >= 200) {
      return {
        success: true,
        options: [
          {
            name: 'Frete Grátis',
            price: 0,
            deliveryTime: '5-7 dias úteis',
            description: 'Entrega gratuita para compras acima de R$ 200,00'
          }
        ]
      };
    }

    const cepNumber = parseInt(cep.replace(/\D/g, ''));
    let basePrice = 15.90;
    let deliveryTime = '3-5 dias úteis';

    if (cepNumber >= 60000000 && cepNumber <= 63999999) {
      basePrice = 9.90;
      deliveryTime = '2-3 dias úteis';
    } else if (cepNumber >= 50000000 && cepNumber <= 89999999) {
      basePrice = 12.90;
      deliveryTime = '3-4 dias úteis';
    } else if (cepNumber >= 70000000 && cepNumber <= 77999999) {
      basePrice = 18.90;
      deliveryTime = '4-6 dias úteis';
    } else if (cepNumber >= 80000000 && cepNumber <= 99999999) {
      basePrice = 22.90;
      deliveryTime = '5-7 dias úteis';
    } else {
      basePrice = 19.90;
      deliveryTime = '4-6 dias úteis';
    }

    return {
      success: true,
      options: [
        {
          name: 'Entrega Padrão',
          price: basePrice,
          deliveryTime: deliveryTime,
          description: 'Entrega pelos Correios'
        },
        {
          name: 'Entrega Expressa',
          price: basePrice * 1.8,
          deliveryTime: deliveryTime.replace(/\d+-(\d+)/, (match, p1) => `1-${Math.max(1, parseInt(p1) - 2)}`),
          description: 'Entrega expressa via transportadora'
        }
      ]
    };

  } catch (error) {
    console.error('Error calculating shipping:', error);
    return {
      success: false,
      error: error.message || 'Erro ao calcular frete.'
    };
  }
};

export const getShippingCost = async (cep, cartTotal = 0, freeShippingApplied = false) => {
  const result = await calculateShipping(cep, cartTotal, freeShippingApplied);

  if (!result.success) {
    throw new Error(result.error);
  }

  const standardOption = result.options[0];
  return {
    cost: standardOption.price,
    deliveryTime: standardOption.deliveryTime,
    description: standardOption.description,
    isFree: standardOption.price === 0
  };
};