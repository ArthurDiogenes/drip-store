import React from 'react';
import StatusBadge from '../StatusBadge/StatusBadge';
import styles from './OrderItem.module.css';

/**
 * OrderItem Component - Displays a single order with product details and status
 */
const OrderItem = ({ orderId, productName, productImage, status, statusText }) => {
  // Function to determine which status badge to display
  const renderStatusBadge = () => {
    // Use the actual status text instead of just the type
    const displayText = statusText || getStatusText(status);
    
    switch (status) {
      case 'transit':
        return <StatusBadge status={displayText} type="transit" />;
      case 'completed':
        return <StatusBadge status={displayText} type="completed" />;
      case 'canceled':
        return <StatusBadge status={displayText} type="canceled" />;
      default:
        return <StatusBadge status={displayText} type="default" />;
    }
  };

  // Fallback status text mapping
  const getStatusText = (statusType) => {
    switch (statusType) {
      case 'transit':
        return 'Em Trânsito';
      case 'completed':
        return 'Finalizado';
      case 'canceled':
        return 'Cancelado';
      default:
        return 'Em Processamento';
    }
  };

  return (
    <div className={styles.orderItem}>
      {/* Order identifier */}
      <div className={styles.orderNumber}>
        <span className={styles.orderLabel}>Pedido nº</span>
        <span className={styles.orderId}>{orderId}</span>
      </div>

      <div className={styles.orderContent}>
        {/* Product image */}
        <div className={styles.productImage}>
          <img 
            src={productImage} 
            alt={productName} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/icons/icon-category-sneakers.svg";
            }}
          />
        </div>

        {/* Product details */}
        <div className={styles.productDetails}>
          <h3 className={styles.productName}>{productName}</h3>
        </div>

        {/* Order status */}
        <div className={styles.orderStatus}>
          {renderStatusBadge()}
        </div>
      </div>
    </div>
  );
};

export default OrderItem;