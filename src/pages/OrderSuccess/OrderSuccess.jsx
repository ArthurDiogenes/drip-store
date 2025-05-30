import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { clearCart, getCart } from '../../services/cartService';
import Layout from '../../components/layout/Layout';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useUser();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeOrderSuccess = async () => {
      try {
        let data = location.state?.orderData;
        const orderCode = location.state?.orderCode;

        if (!data) {
          const storedData = localStorage.getItem('lastOrderData');
          if (storedData) {
            data = JSON.parse(storedData);
            localStorage.removeItem('lastOrderData');
          }
        }

        if (!data && !orderCode) {
          console.warn('No order data found, redirecting to home');
          navigate('/');
          return;
        }

        if (user) {
          try {
            const cartId = await getCart(user.id);
            await clearCart(cartId);
            window.dispatchEvent(new CustomEvent('cartUpdated'));
          } catch (cartError) {
            console.error('Error clearing cart:', cartError);
          }
        }

        const displayData = {
          orderCode: orderCode || data?.orderCode || generateOrderCode(),
          personalInfo: {
            name: profile?.nome_completo || data?.personalInfo?.name || 'Usuário',
            cpf: profile?.cpf || '000.000.000-00',
            email: user?.email || data?.personalInfo?.email || '',
            phone: profile?.celular || data?.personalInfo?.phone || ''
          },
          deliveryInfo: {
            address: data?.shippingAddress?.endereco || profile?.endereco || '',
            district: data?.shippingAddress?.bairro || profile?.bairro || '',
            city: `${data?.shippingAddress?.cidade || profile?.cidade || ''}, ${data?.shippingAddress?.estado || profile?.estado || 'CE'}`,
            zipCode: data?.shippingAddress?.cep || profile?.cep || ''
          },
          paymentInfo: {
            method: data?.paymentMethod || 'Cartão de Crédito',
            cardHolder: data?.cardName || profile?.nome_completo || 'USUARIO',
            cardLastDigits: data?.cardNumber ? data.cardNumber.slice(-4) : '0000'
          },
          orderSummary: {
            products: data?.items?.map(item => ({
              id: item.produto_id,
              name: item.nome || 'Produto',
              price: item.price || item.preco_unitario || 0,
              quantity: item.quantidade || 1,
              image: item.imagemUrl || '../images/products/produc-image-0.png'
            })) || [
                {
                  id: 1,
                  name: 'Tênis Nike Revolution 6 Next Nature Masculino',
                  price: 219.00,
                  quantity: 1,
                  image: '../images/products/produc-image-7.png'
                }
              ],
            subtotal: data?.subtotal || 219.00,
            shipping: data?.shipping || 0,
            discount: data?.discount || 0,
            total: data?.total || 219.00
          }
        };

        setOrderData(displayData);

      } catch (error) {
        console.error('Error initializing order success:', error);
        setOrderData({
          orderCode: generateOrderCode(),
          personalInfo: {
            name: profile?.nome_completo || 'Usuário',
            cpf: '000.000.000-00',
            email: user?.email || '',
            phone: '(00) 00000-0000'
          },
          deliveryInfo: {
            address: 'Endereço não informado',
            district: 'Bairro não informado',
            city: 'Cidade não informada',
            zipCode: '00000-000'
          },
          paymentInfo: {
            method: 'Cartão de Crédito',
            cardHolder: 'USUARIO',
            cardLastDigits: '0000'
          },
          orderSummary: {
            products: [{
              id: 1,
              name: 'Produto do Pedido',
              price: 219.00,
              quantity: 1,
              image: '../images/products/produc-image-0.png'
            }],
            total: 219.00
          }
        });
      } finally {
        setLoading(false);
      }
    };

    initializeOrderSuccess();
  }, [location.state, navigate, user, profile]);

  const generateOrderCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${timestamp}${random}`;
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '000.000.000-00';
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  };

  const formatPhone = (phone) => {
    if (!phone) return '(00) 00000-0000';
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const formatCEP = (cep) => {
    if (!cep) return '00000-000';
    const numbers = cep.replace(/\D/g, '');
    if (numbers.length === 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return cep;
  };

  if (loading) {
    return (
      <Layout>
        <div className="bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm max-w-2xl mx-auto p-6 md:p-8 animate-pulse">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!orderData) {
    return (
      <Layout>
        <div className="bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😔</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedido não encontrado</h1>
              <p className="text-gray-600 mb-6">
                Não foi possível carregar os dados do seu pedido.
              </p>
              <Link
                to="/"
                className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors"
              >
                Voltar para Home
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm max-w-2xl mx-auto p-6 md:p-8">

            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🎉</div>
              <h1 className="text-xl md:text-2xl font-medium">
                Compra Realizada com sucesso!
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Pedido nº {orderData.orderCode}
              </p>
            </div>

            <div className="border-t border-gray-200 mb-6"></div>

            <section className="mb-6">
              <h2 className="text-base font-medium mb-3">Informações Pessoais</h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-sm text-gray-500 w-14">Nome:</span>
                  <p className="text-sm">{orderData.personalInfo.name}</p>
                </div>
                <div className="flex">
                  <span className="text-sm text-gray-500 w-14">CPF:</span>
                  <p className="text-sm">{formatCPF(orderData.personalInfo.cpf)}</p>
                </div>
                <div className="flex">
                  <span className="text-sm text-gray-500 w-14">Email:</span>
                  <p className="text-sm">{orderData.personalInfo.email}</p>
                </div>
                <div className="flex">
                  <span className="text-sm text-gray-500 w-14">Celular:</span>
                  <p className="text-sm">{formatPhone(orderData.personalInfo.phone)}</p>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200 mb-6"></div>

            <section className="mb-6">
              <h2 className="text-base font-medium mb-3">Informações de Entrega</h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-sm text-gray-500 w-20">Endereço:</span>
                  <p className="text-sm">{orderData.deliveryInfo.address}</p>
                </div>
                <div className="flex">
                  <span className="text-sm text-gray-500 w-20">Bairro:</span>
                  <p className="text-sm">{orderData.deliveryInfo.district}</p>
                </div>
                <div className="flex">
                  <span className="text-sm text-gray-500 w-20">Cidade:</span>
                  <p className="text-sm">{orderData.deliveryInfo.city}</p>
                </div>
                <div className="flex">
                  <span className="text-sm text-gray-500 w-20">CEP:</span>
                  <p className="text-sm">{formatCEP(orderData.deliveryInfo.zipCode)}</p>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200 mb-6"></div>

            <section className="mb-6">
              <h2 className="text-base font-medium mb-3">Informações de Pagamento</h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-sm text-gray-500 w-32">Método:</span>
                  <p className="text-sm">{orderData.paymentInfo.method}</p>
                </div>
                {orderData.paymentInfo.method.includes('Cartão') && (
                  <>
                    <div className="flex">
                      <span className="text-sm text-gray-500 w-32">Titular do Cartão:</span>
                      <p className="text-sm">{orderData.paymentInfo.cardHolder}</p>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-500 w-32">Final:</span>
                      <p className="text-sm">************{orderData.paymentInfo.cardLastDigits}</p>
                    </div>
                  </>
                )}
              </div>
            </section>

            <div className="border-t border-gray-200 mb-6"></div>

            <section className="mb-6">
              <h2 className="text-base font-medium mb-3">Resumo da compra</h2>
              <div className="bg-gray-100 p-3 rounded-md space-y-3">
                {orderData.orderSummary.products.map((product, index) => (
                  <div key={product.id || index} className="flex items-center">
                    <div className="w-16 h-16 bg-white rounded-md flex items-center justify-center p-2 mr-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '../images/products/produc-image-0.png';
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-gray-600">
                        Quantidade: {product.quantity}
                        {product.price && (
                          <span className="ml-2">
                            R$ {(product.price * product.quantity).toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-8 bg-amber-50 p-4 rounded-md">
              {orderData.orderSummary.subtotal && (
                <div className="space-y-1 text-sm mb-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {orderData.orderSummary.subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {orderData.orderSummary.shipping > 0 && (
                    <div className="flex justify-between">
                      <span>Frete:</span>
                      <span>R$ {orderData.orderSummary.shipping.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  {orderData.orderSummary.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto:</span>
                      <span>-R$ {orderData.orderSummary.discount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between items-center">
                <h2 className="text-base font-medium">Total</h2>
                <p className="text-black font-medium">
                  R$ {orderData.orderSummary.total.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <p className="text-xs text-gray-500 text-right">
                ou 10x de R$ {(orderData.orderSummary.total / 10).toFixed(2).replace('.', ',')} sem juros
              </p>
            </section>

            <div className="space-y-3">
              <button
                className="w-full text-gray-700 text-sm py-2 text-center underline hover:text-gray-900 transition-colors"
                onClick={() => window.print()}
              >
                Imprimir Recibo
              </button>

              <Link
                to="/meus-pedidos"
                className="block w-full bg-pink-600 text-center text-white font-medium py-3 rounded-md hover:bg-pink-700 transition-colors"
              >
                Ver Meus Pedidos
              </Link>

              <Link
                to="/"
                className="block w-full bg-yellow-500 text-center text-white font-medium py-3 rounded-md hover:bg-yellow-600 transition-colors"
              >
                Voltar para Home
              </Link>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccess;