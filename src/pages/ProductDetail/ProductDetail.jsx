import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, X, ShoppingCart } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import ProductGallery from '../../components/ProductGallery/ProductGallery';
import ProductRating from '../../components/ProductRating/ProductRating';
import ProductPrice from '../../components/ProductPrice/ProductPrice';
import SizeSelector from '../../components/SizeSelector/SizeSelector';
import ColorSelector from '../../components/ColorSelector/ColorSelector';
import ProductCard from '../../components/ProductCard/ProductCard';
import { getProductBySlug, getRelatedProducts } from '../../services/productService';
import { useUser } from '../../contexts/UserContext';
import styles from './ProductDetail.module.css';

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
      case 'cart':
        return <ShoppingCart className="w-5 h-5 text-blue-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-white border-l-4 border-green-500 shadow-lg';
      case 'cart':
        return 'bg-white border-l-4 border-blue-500 shadow-lg';
      case 'error':
        return 'bg-white border-l-4 border-red-500 shadow-lg';
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

const ProductDetail = () => {
  const { id: productSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const [buttonState, setButtonState] = useState('default');

  useEffect(() => {
    const loadProductData = async () => {
      if (!productSlug) {
        setError('Produto não encontrado.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const productData = await getProductBySlug(productSlug);

        if (!productData) {
          setError('Produto não encontrado.');
          setLoading(false);
          return;
        }

        setProduct(productData);

        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }

        console.log('Product loaded:', {
          name: productData.name,
          category: productData.category,
          sizes: productData.sizes,
          colors: productData.colors,
          variations: productData.variations
        });

        try {
          const related = await getRelatedProducts(productData.id, 4);
          setRelatedProducts(related);
        } catch (relatedError) {
          console.error('Error loading related products:', relatedError);
        }

      } catch (err) {
        console.error('Error loading product:', err);
        if (err.message?.includes('not found')) {
          setError('Produto não encontrado.');
        } else {
          setError('Erro ao carregar produto. Tente novamente mais tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [productSlug]);

  const getBreadcrumbItems = () => {
    if (!product) return [];

    return [
      { label: 'Home', path: '/' },
      { label: 'Produtos', path: '/produtos' },
      ...(product.category ? [{ label: product.category, path: `/produtos?categoria=${product.category.toLowerCase()}` }] : []),
      ...(product.brand ? [{ label: product.brand, path: `/produtos?marca=${product.brand.toLowerCase()}` }] : []),
      { label: product.name, path: '#' }
    ];
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const showToast = (message, type = 'success') => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  const handleAddToCart = async () => {
    console.log('Selected size:', selectedSize, 'Selected color:', selectedColor);

    try {
      setButtonState('loading');

      const { getCart, addToCartSimple } = await import('../../services/cartService');

      const cartId = await getCart(user?.id);

      console.log('Adding to cart:', {
        cartId,
        productId: product.id
      });

      await addToCartSimple(cartId, product.id, 1);

      setButtonState('success');

      showToast(`${product.name} foi adicionado ao carrinho!`, 'cart');

      window.dispatchEvent(new CustomEvent('cartUpdated'));

      setTimeout(() => {
        setButtonState('default');
      }, 2000);

    } catch (error) {
      console.error('Error adding to cart:', error);

      setButtonState('default');

      showToast('Erro ao adicionar produto ao carrinho. Tente novamente.', 'error');
    }
  };

  const getButtonContent = () => {
    switch (buttonState) {
      case 'loading':
        return (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ADICIONANDO...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            ADICIONADO!
          </>
        );
      default:
        return 'COMPRAR';
    }
  };

  const getButtonStyles = () => {
    const baseStyles = styles.buyButton;
    switch (buttonState) {
      case 'success':
        return `${baseStyles} !bg-green-600 hover:!bg-green-700`;
      case 'loading':
        return `${baseStyles} !bg-gray-400 cursor-not-allowed`;
      default:
        return baseStyles;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.breadcrumbContainer}>
          <div className="container mx-auto px-4">
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className={styles.productContainer}>
            <div className={styles.galleryContainer}>
              <div className="w-full h-96 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>

            <div className={styles.infoContainer}>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
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
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
            <p className="text-gray-600 mb-6">
              {error.includes('não encontrado')
                ? 'O produto que você está procurando não existe ou foi removido.'
                : 'Houve um problema ao carregar o produto.'
              }
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/produtos')}
                className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors"
              >
                Ver Todos os Produtos
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Produto não encontrado</h1>
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

      <div className={styles.breadcrumbContainer}>
        <div className="container mx-auto px-4">
          <Breadcrumb items={getBreadcrumbItems()} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className={styles.productContainer}>
          <div className={styles.galleryContainer}>
            <ProductGallery images={product.images} />
          </div>

          <div className={styles.infoContainer}>
            <h1 className={styles.productTitle}>{product.name}</h1>

            <div className={styles.productMeta}>
              {product.category && <span>{product.category}</span>}
              {product.category && product.brand && <span className={styles.divider}>|</span>}
              {product.brand && <span>{product.brand}</span>}
              {(product.category || product.brand) && product.ref && <span className={styles.divider}>|</span>}
              {product.ref && <span>{product.ref}</span>}
            </div>

            {product.rating && (
              <ProductRating
                rating={product.rating}
                reviewCount={product.reviewCount}
              />
            )}

            <ProductPrice
              currentPrice={product.currentPrice}
              originalPrice={product.originalPrice}
            />

            {product.description && (
              <div className={styles.descriptionContainer}>
                <h2 className={styles.sectionTitle}>Descrição do produto</h2>
                <p className={styles.descriptionText}>{product.description}</p>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <SizeSelector
                sizes={product.sizes}
                selectedSize={selectedSize}
                onSizeSelect={setSelectedSize}
              />
            )}

            {product.colors && product.colors.length > 0 && (
              <ColorSelector
                colors={product.colors}
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
              />
            )}

            <button
              className={`${getButtonStyles()} flex items-center justify-center transition-all duration-300`}
              onClick={handleAddToCart}
              disabled={buttonState === 'loading'}
            >
              {getButtonContent()}
            </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Produtos Relacionados</h2>
            <button
              onClick={() => navigate('/produtos')}
              className="text-pink-600 text-sm flex items-center hover:underline"
            >
              Ver todos <span className="ml-1">→</span>
            </button>
          </div>
          <ProductCard produtos={relatedProducts} />
        </div>
      )}
    </Layout>
  );
};

export default ProductDetail;