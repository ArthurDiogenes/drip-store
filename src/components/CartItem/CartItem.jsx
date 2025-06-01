import React from 'react';
import styles from './CartItem.module.css';

const CartItem = ({ 
  product, 
  quantity, 
  onQuantityChange, 
  onRemove,
  disabled = false
}) => {
  const decreaseQuantity = () => {
    if (disabled || quantity <= 1) return;
    onQuantityChange(quantity - 1);
  };

  const increaseQuantity = () => {
    if (disabled) return;
    onQuantityChange(quantity + 1);
  };

  const handleRemove = () => {
    if (disabled) return;
    onRemove();
  };

  return (
    <div className={`${styles.cartItem} ${disabled ? styles.loading : ''}`}>
      <div className={styles.productColumn}>
        <div className={styles.productImage}>
          <img 
            src={product.imagemUrl} 
            alt={product.nome} 
            className={styles.image}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '../images/products/produc-image-0.png';
            }}
          />
          {disabled && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner}></div>
            </div>
          )}
        </div>
        <div className={styles.productDetails}>
          <h3 className={styles.productName}>{product.nome}</h3>
          {product.cor && (
            <p className={styles.productOption}>Cor: {product.cor}</p>
          )}
          {product.tamanho && (
            <p className={styles.productOption}>Tamanho: {product.tamanho}</p>
          )}
          <button 
            onClick={handleRemove} 
            className={styles.removeLink}
            disabled={disabled}
          >
            {disabled ? 'Removendo...' : 'Remover item'}
          </button>
        </div>
      </div>

      <div className={styles.quantityColumn}>
        <div className={styles.quantityControls}>
          <button 
            onClick={decreaseQuantity}
            className={styles.quantityButton}
            aria-label="Diminuir quantidade"
            disabled={disabled || quantity <= 1}
          >
            −
          </button>
          <input
            type="text"
            value={quantity}
            readOnly
            className={styles.quantityInput}
            aria-label="Quantidade"
          />
          <button 
            onClick={increaseQuantity}
            className={styles.quantityButton}
            aria-label="Aumentar quantidade"
            disabled={disabled}
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.unitPriceColumn}>
        {product.precoOriginal > product.precoAtual && (
          <p className={styles.originalPrice}>R$ {product.precoOriginal.toFixed(2).replace('.', ',')}</p>
        )}
        <p className={styles.currentPrice}>R$ {product.precoAtual.toFixed(2).replace('.', ',')}</p>
      </div>

      <div className={styles.totalColumn}>
        <p className={styles.currentPrice}>R$ {(product.precoAtual * quantity).toFixed(2).replace('.', ',')}</p>
      </div>
    </div>
  );
};

export default CartItem;