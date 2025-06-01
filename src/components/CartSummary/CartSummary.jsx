import React from 'react';
import styles from './CartSummary.module.css';

const CartSummary = ({ 
  subtotal, 
  shipping = 0, 
  discount = 0,
  onCheckout 
}) => {
  const total = subtotal - discount + shipping;
  
  const installmentAmount = (total / 10).toFixed(2);

  return (
    <div className={styles.cartSummary}>
      <h2 className={styles.heading}>RESUMO</h2>
      
      <div className={styles.divider}></div>
      
      <div className={styles.summaryItem}>
        <span className={styles.summaryLabel}>Subtotal:</span>
        <span className={styles.summaryValue}>R$ {subtotal.toFixed(2)}</span>
      </div>
      
      <div className={styles.summaryItem}>
        <span className={styles.summaryLabel}>Frete:</span>
        <span className={styles.summaryValue}>
          {shipping === 0 ? 'R$ 0,00' : `R$ ${shipping.toFixed(2)}`}
        </span>
      </div>
      
      <div className={styles.summaryItem}>
        <span className={styles.summaryLabel}>Desconto:</span>
        <span className={styles.summaryValue}>R$ {discount.toFixed(2)}</span>
      </div>
      
      <div className={styles.divider}></div>
      
      <div className={styles.totalItem}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValue}>R$ {total.toFixed(2)}</span>
      </div>
      
      <p className={styles.installmentInfo}>
        ou 10x de R$ {installmentAmount} sem juros
      </p>
      
      <button 
        className={styles.checkoutButton}
        onClick={onCheckout}
      >
        Continuar
      </button>
    </div>
  );
};

export default CartSummary;