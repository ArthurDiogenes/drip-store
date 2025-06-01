import React from 'react';
import StatusBadge from '../StatusBadge/StatusBadge';
import styles from './OrderItem.module.css';

const OrderItem = ({ orderId, productName, productImage, status, statusText }) => {
  const renderStatusBadge = () => {
    const displayText = statusText || getStatusText(status);
    
    switch (status) {
      case 'pending':
        return <StatusBadge status={displayText} type="pending" />;
      case 'processing':
        return <StatusBadge status={displayText} type="processing" />;
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

  const getStatusText = (statusType) => {
    switch (statusType) {
      case 'pending':
        return 'Aguardando Pagamento';
      case 'processing':
        return 'Em Preparação';
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
      <div className={styles.orderNumber}>
        <span className={styles.orderLabel}>Pedido nº</span>
        <span className={styles.orderId}>{orderId}</span>
      </div>

      <div className={styles.orderContent}>
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

        <div className={styles.productDetails}>
          <h3 className={styles.productName}>{productName}</h3>
        </div>

        <div className={styles.orderStatus}>
          {renderStatusBadge()}
        </div>
      </div>
    </div>
  );
};

export default OrderItem;