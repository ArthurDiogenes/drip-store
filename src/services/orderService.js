import { supabase } from './supabase';

const generateOrderCode = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${timestamp}${random}`;
};

export const createOrder = async (orderData) => {
  try {
    console.log('Creating order with data:', orderData);
    
    const orderCode = generateOrderCode();
    
    const { data: order, error: orderError } = await supabase
      .from('pedidos')
      .insert({
        codigo: orderCode,
        usuario_id: orderData.userId,
        status: 'Pagamento Confirmado',
        valor_produtos: orderData.subtotal,
        valor_frete: orderData.shipping || 0,
        valor_desconto: orderData.discount || 0,
        valor_total: orderData.total,
        metodo_pagamento: orderData.paymentMethod,
        parcelas: orderData.installments || 1,
        endereco_entrega: orderData.shippingAddress.endereco,
        bairro_entrega: orderData.shippingAddress.bairro,
        cidade_entrega: orderData.shippingAddress.cidade,
        estado_entrega: orderData.shippingAddress.estado,
        cep_entrega: orderData.shippingAddress.cep,
        complemento_entrega: orderData.shippingAddress.complemento || ''
      })
      .select()
      .single();
    
    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }
    
    console.log('Order created:', order);
    
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map(item => ({
        pedido_id: order.id,
        produto_id: item.produto_id,
        variacao_id: item.variacao_id || null,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        preco_total: item.preco_unitario * item.quantidade
      }));
      
      const { error: itemsError } = await supabase
        .from('itens_pedido')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        await supabase.from('pedidos').delete().eq('id', order.id);
        throw itemsError;
      }
    }
    
    return {
      ...order,
      items: orderData.items
    };
    
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw error;
  }
};

export const getUserOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        id,
        codigo,
        status,
        valor_total,
        data_criacao,
        itens_pedido (
          id,
          quantidade,
          preco_unitario,
          produto_id (
            id,
            nome,
            slug,
            imagens_produto (url, principal, ordem)
          )
        )
      `)
      .eq('usuario_id', userId)
      .order('data_criacao', { ascending: false });
    
    if (error) throw error;
    
    return data.map(order => {
      const firstItem = order.itens_pedido[0];
      const product = firstItem?.produto_id;
      const images = product?.imagens_produto || [];
      const principalImage = images.find(img => img.principal) || images[0];
      
      let statusType = 'default';
      
      switch (order.status) {
        case 'Aguardando Pagamento':
          statusType = 'pending';
          break;
        case 'Pagamento Confirmado':
        case 'Em Preparação':
          statusType = 'processing';
          break;
        case 'Em Trânsito':
          statusType = 'transit';
          break;
        case 'Entregue':
        case 'Finalizado':
          statusType = 'completed';
          break;
        case 'Cancelado':
          statusType = 'canceled';
          break;
        default:
          statusType = 'default';
      }

      return {
        id: order.codigo,
        productName: product?.nome || 'Produto não encontrado',
        productImage: principalImage?.url || '../images/products/produc-image-0.png',
        status: statusType,
        statusText: order.status,
        totalValue: order.valor_total,
        createdAt: order.data_criacao
      };
    });
    
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
    
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        itens_pedido (
          *,
          produto_id (
            id,
            nome,
            slug,
            imagens_produto (url, principal, ordem)
          )
        )
      `)
      .eq('id', orderId)
      .single();
    
    if (error) throw error;
    return data;
    
  } catch (error) {
    console.error('Error getting order by ID:', error);
    throw error;
  }
};