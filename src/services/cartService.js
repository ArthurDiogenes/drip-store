import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

const getCartSessionId = () => {
  let sessionId = localStorage.getItem('cartSessionId');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('cartSessionId', sessionId);
  }
  return sessionId;
};

export const getCart = async (userId = null) => {
  try {
    console.log('Getting cart for user:', userId);
    
    if (userId) {
      console.log('User is logged in, checking for existing cart...');
      const { data: userCarts, error: userCartError } = await supabase
        .from('carrinho')
        .select('id')
        .eq('usuario_id', userId)
        .order('data_criacao', { ascending: false });
      
      if (userCartError) {
        console.error('Error checking user cart:', userCartError);
        throw userCartError;
      }
      
      if (userCarts && userCarts.length > 0) {
        console.log('Found existing user cart(s):', userCarts);
        return userCarts[0].id;
      }
      
      console.log('Creating new cart for user...');
      const { data: newUserCart, error: createError } = await supabase
        .from('carrinho')
        .insert({ usuario_id: userId })
        .select('id')
        .single();
        
      if (createError) {
        console.error('Error creating user cart:', createError);
        throw createError;
      }
      
      console.log('Created new user cart:', newUserCart.id);
      return newUserCart.id;
    } 
    
    const sessionId = getCartSessionId();
    console.log('Guest user, using session ID:', sessionId);
    
    const { data: sessionCarts, error: sessionCartError } = await supabase
      .from('carrinho')
      .select('id')
      .eq('sessao_id', sessionId)
      .order('data_criacao', { ascending: false }); 
      
    if (sessionCartError) {
      console.error('Error checking session cart:', sessionCartError);
      throw sessionCartError;
    }
    
    if (sessionCarts && sessionCarts.length > 0) {
      console.log('Found existing session cart(s):', sessionCarts);
      return sessionCarts[0].id; 
    }
    
    console.log('Creating new cart for session...');
    const { data: newSessionCart, error: createError } = await supabase
      .from('carrinho')
      .insert({ sessao_id: sessionId })
      .select('id')
      .single();
      
    if (createError) {
      console.error('Error creating session cart:', createError);
      throw createError;
    }
    
    console.log('Created new session cart:', newSessionCart.id);
    return newSessionCart.id;
    
  } catch (error) {
    console.error('Error getting cart:', error);
    throw error;
  }
};

export const debugCartData = async () => {
  console.log('=== DEBUG: All Cart Data ===');
  
  try {
    const { data: allCarts } = await supabase
      .from('carrinho')
      .select('*');
    console.log('All carts:', allCarts);
    
    const { data: allCartItems } = await supabase
      .from('itens_carrinho')
      .select('*');
    console.log('All cart items:', allCartItems);
    
    const { data: allProducts } = await supabase
      .from('produtos')
      .select('id, nome');
    console.log('All products:', allProducts);
    
  } catch (error) {
    console.error('Debug error:', error);
  }
  
  console.log('=== END DEBUG ===');
};

export const getCartItems = async (cartId) => {
  console.log('Getting cart items for cart ID:', cartId);
  
  try {
    const { data: cartItems, error: cartError } = await supabase
      .from('itens_carrinho')
      .select('id, quantidade, preco_unitario, produto_id')
      .eq('carrinho_id', cartId);
    
    if (cartError) {
      console.error('Error fetching cart items:', cartError);
      throw cartError;
    }
    
    console.log('Raw cart items:', cartItems);
    
    if (!cartItems || cartItems.length === 0) {
      return [];
    }
    
    const productIds = cartItems.map(item => item.produto_id);
    
    const { data: products, error: productsError } = await supabase
      .from('produtos')
      .select(`
        id,
        nome,
        preco_original,
        preco_promocional,
        slug,
        imagens_produto (url, principal, ordem)
      `)
      .in('id', productIds);
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }
    
    console.log('Products found:', products);
    
    const transformedItems = cartItems.map(item => {
      const product = products.find(p => p.id === item.produto_id);
      
      if (!product) {
        console.warn('Product not found for cart item:', item);
        return null;
      }
      
      const images = product.imagens_produto || [];
      const principalImage = images.find(img => img.principal) || images[0];
      
      return {
        id: item.id,
        quantidade: item.quantidade,
        precoUnitario: item.preco_unitario,
        produto: {
          id: product.id,
          nome: product.nome,
          slug: product.slug,
          precoOriginal: product.preco_original,
          precoAtual: product.preco_promocional || product.preco_original,
          imagemUrl: principalImage?.url || '../images/products/produc-image-0.png'
        },
        cor: '',
        tamanho: ''
      };
    }).filter(item => item !== null); 
    
    console.log('Final transformed cart items:', transformedItems);
    return transformedItems;
    
  } catch (error) {
    console.error('Error in getCartItems:', error);
    throw error;
  }
};

export const addToCart = async (cartId, productId, variationId, quantity = 1) => {
  const { data: existingItem } = await supabase
    .from('itens_carrinho')
    .select('id, quantidade')
    .eq('carrinho_id', cartId)
    .eq('variacao_id', variationId)
    .maybeSingle();
    
  const { data: product } = await supabase
    .from('produtos')
    .select('preco_promocional, preco_original')
    .eq('id', productId)
    .single();
    
  if (!product) throw new Error('Product not found');
  
  const priceToUse = product.preco_promocional || product.preco_original;
  
  if (existingItem) {
    const { data, error } = await supabase
      .from('itens_carrinho')
      .update({ quantidade: existingItem.quantidade + quantity })
      .eq('id', existingItem.id)
      .select();
      
    if (error) throw error;
    return data;
  }
  
  const { data, error } = await supabase
    .from('itens_carrinho')
    .insert({
      carrinho_id: cartId,
      produto_id: productId,
      variacao_id: variationId,
      quantidade: quantity,
      preco_unitario: priceToUse
    })
    .select();
    
  if (error) throw error;
  return data;
};

export const updateCartItemQuantity = async (itemId, quantity) => {
  const { data, error } = await supabase
    .from('itens_carrinho')
    .update({ quantidade: quantity })
    .eq('id', itemId)
    .select();
    
  if (error) throw error;
  return data;
};

export const removeCartItem = async (itemId) => {
  const { error } = await supabase
    .from('itens_carrinho')
    .delete()
    .eq('id', itemId);
    
  if (error) throw error;
  return true;
};

export const getCartSummary = async (cartId) => {
  const { data, error } = await supabase
    .from('itens_carrinho')
    .select(`
      id,
      quantidade,
      preco_unitario
    `)
    .eq('carrinho_id', cartId);
    
  if (error) throw error;
  
  const subtotal = data.reduce((sum, item) => {
    return sum + (item.quantidade * item.preco_unitario);
  }, 0);
  
  const totalItems = data.reduce((sum, item) => {
    return sum + item.quantidade;
  }, 0);
  
  return {
    subtotal,
    totalItems
  };
};

export const clearCart = async (cartId) => {
  const { error } = await supabase
    .from('itens_carrinho')
    .delete()
    .eq('carrinho_id', cartId);
    
  if (error) throw error;
  return true;
};

export const addToCartSimple = async (cartId, productId, quantity = 1) => {
  try {
    console.log('Adding to cart:', { cartId, productId, quantity });
    
    const { data: product, error: productError } = await supabase
      .from('produtos')
      .select('preco_promocional, preco_original, nome')
      .eq('id', productId)
      .single();
      
    if (productError) {
      console.error('Error fetching product:', productError);
      throw productError;
    }
    
    if (!product) throw new Error('Product not found');
    
    const priceToUse = product.preco_promocional || product.preco_original;
    console.log('Product price to use:', priceToUse);
    
    const { data: existingItem, error: existingError } = await supabase
      .from('itens_carrinho')
      .select('id, quantidade')
      .eq('carrinho_id', cartId)
      .eq('produto_id', productId)
      .is('variacao_id', null)
      .maybeSingle();
    
    if (existingError) {
      console.error('Error checking existing item:', existingError);
      throw existingError;
    }
    
    if (existingItem) {
      console.log('Updating existing item:', existingItem);
      const { data, error } = await supabase
        .from('itens_carrinho')
        .update({ quantidade: existingItem.quantidade + quantity })
        .eq('id', existingItem.id)
        .select();
        
      if (error) {
        console.error('Error updating item:', error);
        throw error;
      }
      console.log('Item updated successfully:', data);
      return data;
    }
    
    console.log('Adding new item to cart');
    const { data, error } = await supabase
      .from('itens_carrinho')
      .insert({
        carrinho_id: cartId,
        produto_id: productId,
        quantidade: quantity,
        preco_unitario: priceToUse,
        variacao_id: null
      })
      .select();
      
    if (error) {
      console.error('Error inserting new item:', error);
      throw error;
    }
    
    console.log('Item added successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in addToCartSimple:', error);
    throw error;
  }
};