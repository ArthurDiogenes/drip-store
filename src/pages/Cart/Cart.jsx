import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, X, ShoppingCart, AlertTriangle, Trash2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import CartItem from '../../components/CartItem/CartItem';
import CartSummary from '../../components/CartSummary/CartSummary';
import DiscountCode from '../../components/DiscountCode/DiscountCode';
import ShippingCalculator from '../../components/ShippingCalculator/ShippingCalculator';
import ProductCard from '../../components/ProductCard/ProductCard';
import { useUser } from '../../contexts/UserContext';
import { useCart } from '../../contexts/CartContext';
import {
  getCart,
  getCartItems,
  updateCartItemQuantity,
  removeCartItem,
  clearCart
} from '../../services/cartService';
import { getFeaturedProducts } from '../../services/productService';
import { getShippingCost } from '../../services/shippingService';
import styles from './Cart.module.css';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      case 'info':
        return <ShoppingCart className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-white border-l-4 border-green-500 shadow-lg';
      case 'error':
        return 'bg-white border-l-4 border-red-500 shadow-lg';
      case 'info':
        return 'bg-white border-l-4 border-blue-500 shadow-lg';
      default:
        return 'bg-white border-l-4 border-green-500 shadow-lg';
    }
  };

  const toastStyles = {
    position: 'fixed',
    top: '80px',
    right: '20px',
    zIndex: 1000,
    maxWidth: '400px',
    width: '100%',
    transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out',
    borderRadius: '8px',
    overflow: 'hidden'
  };

  return (
    <div style={toastStyles}>
      <div className={getStyles()}>
        <div className="flex items-center p-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-gray-900">
              {message}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", type = "danger" }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
    }
  };

  const getConfirmButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default:
        return 'bg-red-600 hover:bg-red-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          {getIcon()}
          <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {message}
          </p>
          <div className="flex space-x-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${getConfirmButtonStyles()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { refreshCart } = useCart();

  const [cartItems, setCartItems] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [cartId, setCartId] = useState(null);

  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);

  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  useEffect(() => {
    loadCartData();
  }, [user]);

  useEffect(() => {
    calculateSubtotal();
  }, [cartItems]);

  const showToast = (message, type = 'success') => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const showConfirmation = (title, message, onConfirm, type = 'danger') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type
    });
  };

  const handleCloseConfirmation = () => {
    setConfirmModal({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      type: 'danger'
    });
  };

  const handleConfirmAction = () => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm();
    }
    handleCloseConfirmation();
  };

  const loadCartData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentCartId = await getCart(user?.id);
      setCartId(currentCartId);

      if (currentCartId) {
        const items = await getCartItems(currentCartId);
        console.log('Cart items loaded:', items);
        setCartItems(items);
      } else {
        setCartItems([]);
      }

      try {
        const featured = await getFeaturedProducts(4);
        setRelatedProducts(featured);
      } catch (featuredError) {
        console.error('Error loading featured products:', featuredError);
        setRelatedProducts([]);
      }

    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Erro ao carregar carrinho. Tente recarregar a página.');
      setCartItems([]);
      showToast('Erro ao carregar carrinho. Tente recarregar a página.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    const total = cartItems.reduce(
      (sum, item) => sum + (item.produto.precoAtual * item.quantidade),
      0
    );
    setSubtotal(total);
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (actionLoading === itemId || newQuantity < 1) return;

    try {
      setActionLoading(itemId);
      setError(null);

      await updateCartItemQuantity(itemId, newQuantity);

      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantidade: newQuantity } : item
        )
      );

      refreshCart();

      showToast('Quantidade atualizada com sucesso!', 'success');

    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Erro ao atualizar quantidade. Tente novamente.');
      showToast('Erro ao atualizar quantidade. Tente novamente.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (actionLoading === itemId) return;

    const itemToRemove = cartItems.find(item => item.id === itemId);

    showConfirmation(
      'Remover item',
      `Tem certeza que deseja remover "${itemToRemove?.produto?.nome}" do carrinho?`,
      async () => {
        try {
          setActionLoading(itemId);
          setError(null);

          await removeCartItem(itemId);

          setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));

          refreshCart();

          showToast('Item removido do carrinho', 'success');

        } catch (err) {
          console.error('Error removing item:', err);
          setError('Erro ao remover item. Tente novamente.');
          showToast('Erro ao remover item. Tente novamente.', 'error');
        } finally {
          setActionLoading(null);
        }
      },
      'danger'
    );
  };

  const handleApplyDiscount = async (discountData) => {
    console.log('Applying discount:', discountData);

    if (discountData.code && discountData.discount > 0) {
      setAppliedCoupon(discountData.couponData);
      setDiscount(discountData.discount);

      if (discountData.freeShipping && shippingInfo) {
        setShipping(0);
        setShippingInfo({
          ...shippingInfo,
          cost: 0,
          isFree: true,
          description: 'Frete grátis aplicado por cupom'
        });
      }
    } else {
      setAppliedCoupon(null);
      setDiscount(0);

      if (shippingInfo && shippingInfo.isFree && subtotal < 200) {
        if (shippingInfo.zipCode) {
          try {
            const newShipping = await getShippingCost(shippingInfo.zipCode, subtotal, false);
            setShipping(newShipping.cost);
            setShippingInfo({
              ...newShipping,
              zipCode: shippingInfo.zipCode
            });
          } catch (error) {
            console.error('Error recalculating shipping:', error);
          }
        }
      }
    }
  };

  const handleCalculateShipping = async (shippingData) => {
    console.log('Calculating shipping:', shippingData);

    try {
      const shouldApplyFreeShipping = appliedCoupon?.freeShipping || subtotal >= 200;

      let finalShippingCost = shippingData.cost;
      let finalShippingInfo = { ...shippingData };

      if (shouldApplyFreeShipping && shippingData.cost > 0) {
        finalShippingCost = 0;
        finalShippingInfo = {
          ...shippingData,
          cost: 0,
          isFree: true,
          description: appliedCoupon?.freeShipping
            ? 'Frete grátis por cupom'
            : 'Frete grátis (compra acima de R$ 200)'
        };
      }

      setShippingInfo(finalShippingInfo);
      setShipping(finalShippingCost);

    } catch (error) {
      console.error('Error in handleCalculateShipping:', error);
      setError('Erro ao calcular frete.');
      showToast('Erro ao calcular frete.', 'error');
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showToast('Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.', 'error');
      return;
    }

    if (!user) {
      showConfirmation(
        'Login Necessário',
        'Você precisa fazer login para finalizar a compra. Deseja fazer login agora?',
        () => {
          navigate('/login');
        },
        'warning'
      );
      return;
    }

    const checkoutData = {
      items: cartItems,
      subtotal,
      discount,
      shipping,
      total: subtotal + shipping - discount,
      appliedCoupon,
      shippingInfo
    };

    console.log('Proceeding to checkout with data:', checkoutData);
    
    try {
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    } catch (err) {
      console.error('Error saving checkout data to localStorage:', err);
    }
    
    showToast('Redirecionando para o checkout...', 'info');

    setTimeout(() => {
      navigate('/checkout', { 
        state: { 
          checkoutData: checkoutData,
          cartItems,
          subtotal,
          discount,
          shipping,
          appliedCoupon,
          shippingInfo
        }
      });
    }, 1000);
  };

  const handleClearCart = async () => {
    if (!cartId || cartItems.length === 0) return;

    showConfirmation(
      'Esvaziar Carrinho',
      `Tem certeza que deseja remover todos os ${cartItems.length} itens do carrinho? Esta ação não pode ser desfeita.`,
      async () => {
        try {
          setLoading(true);
          setError(null);

          await clearCart(cartId);

          setCartItems([]);
          setSubtotal(0);
          setDiscount(0);
          setShipping(0);
          setAppliedCoupon(null);
          setShippingInfo(null);

          refreshCart();

          showToast('Carrinho esvaziado com sucesso', 'success');

        } catch (err) {
          console.error('Error clearing cart:', err);
          setError('Erro ao esvaziar carrinho. Tente novamente.');
          showToast('Erro ao esvaziar carrinho. Tente novamente.', 'error');
        } finally {
          setLoading(false);
        }
      },
      'danger'
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className={styles.cartContent}>
              <div className={styles.cartMain}>
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="border-b border-gray-200 pb-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="w-24 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.cartSummary}>
                <div className="bg-gray-200 h-64 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={handleCloseToast}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Seu carrinho está vazio
              </h1>
              <p className="text-gray-600 mb-6">
                Que tal dar uma olhada nos nossos produtos incríveis?
              </p>
              <button
                onClick={() => navigate('/produtos')}
                className={styles.continueShoppingButton}
              >
                Ver Produtos
              </button>
            </div>

            {relatedProducts.length > 0 && (
              <div className={styles.relatedProducts}>
                <div className={styles.relatedProductsHeader}>
                  <h2 className={styles.relatedProductsTitle}>Produtos em Destaque</h2>
                  <button
                    onClick={() => navigate('/produtos')}
                    className={styles.viewAllLink}
                  >
                    Ver todos <span className={styles.arrow}>→</span>
                  </button>
                </div>
                <ProductCard produtos={relatedProducts} />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className={styles.pageTitle}>MEU CARRINHO</h1>
                <p className="text-sm text-gray-600">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'} no carrinho
                </p>
              </div>
              {cartItems.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-sm text-red-600 hover:text-red-800 underline transition-colors flex items-center gap-1"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                  Esvaziar carrinho
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-800 hover:text-red-900 ml-4"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className={styles.cartContent}>
              <div className={styles.cartMain}>
                <div className={styles.cartHeader}>
                  <div className={styles.productHeader}>PRODUTO</div>
                  <div className={styles.quantityHeader}>QUANTIDADE</div>
                  <div className={styles.unitPriceHeader}>UNITÁRIO</div>
                  <div className={styles.totalHeader}>TOTAL</div>
                </div>

                <div className="space-y-4">
                  {cartItems.map(item => (
                    <CartItem
                      key={item.id}
                      product={{
                        id: item.produto.id,
                        nome: item.produto.nome,
                        cor: item.cor || '',
                        tamanho: item.tamanho || '',
                        precoOriginal: item.produto.precoOriginal || item.produto.precoAtual,
                        precoAtual: item.produto.precoAtual,
                        imagemUrl: item.produto.imagemUrl,
                      }}
                      quantity={item.quantidade}
                      onQuantityChange={(quantity) => handleQuantityChange(item.id, quantity)}
                      onRemove={() => handleRemoveItem(item.id)}
                      disabled={actionLoading === item.id}
                    />
                  ))}
                </div>

                <div className={styles.discountAndShipping}>
                  <div className={styles.discountSection}>
                    <DiscountCode
                      onApplyDiscount={handleApplyDiscount}
                      cartTotal={subtotal}
                      onMessage={showToast}
                    />
                  </div>
                  <div className={styles.shippingSection}>
                    <ShippingCalculator
                      onCalculateShipping={handleCalculateShipping}
                      cartTotal={subtotal}
                      freeShippingApplied={appliedCoupon?.freeShipping || false}
                      onMessage={showToast}
                    />
                  </div>
                </div>

                {(appliedCoupon || shippingInfo || subtotal >= 200) && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                    <h4 className="text-sm font-medium text-green-800 mb-2">
                      ✅ Benefícios Aplicados:
                    </h4>
                    <div className="space-y-1 text-sm text-green-700">
                      {appliedCoupon && (
                        <div className="flex justify-between">
                          <span>• Cupom "{appliedCoupon.code}"</span>
                          <span className="font-medium">
                            -R$ {discount.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      )}
                      {((shippingInfo && shippingInfo.isFree) || subtotal >= 200) && (
                        <div className="flex justify-between">
                          <span>• Frete grátis</span>
                          <span className="font-medium text-green-600">Grátis</span>
                        </div>
                      )}
                      {subtotal < 200 && !appliedCoupon?.freeShipping && (
                        <div className="text-amber-600">
                          💡 Faltam R$ {(200 - subtotal).toFixed(2).replace('.', ',')} para frete grátis!
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.cartSummary}>
                <CartSummary
                  subtotal={subtotal}
                  shipping={shipping}
                  discount={discount}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>

            {relatedProducts.length > 0 && (
              <div className={styles.relatedProducts}>
                <div className={styles.relatedProductsHeader}>
                  <h2 className={styles.relatedProductsTitle}>Você também pode gostar</h2>
                  <button
                    onClick={() => navigate('/produtos')}
                    className={styles.viewAllLink}
                  >
                    Ver todos <span className={styles.arrow}>→</span>
                  </button>
                </div>
                <ProductCard produtos={relatedProducts} />
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Cart;