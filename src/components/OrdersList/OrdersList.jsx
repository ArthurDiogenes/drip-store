import React from 'react';
import OrderItem from '../OrderItem/OrderItem.jsx';
import styles from './OrdersList.module.css';

const OrdersList = ({ orders = [] }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum pedido encontrado
          </h3>
          <p className={styles.emptyStateSubtext}>
            Você ainda não realizou nenhum pedido.
          </p>
          <a href="/produtos" className={styles.shopButton}>
            Ir às compras
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.ordersList}>
      <h2 className={styles.sectionTitle}>Meus Pedidos</h2>
      
      <div className={styles.ordersHeader}>
        <div className={styles.ordersInfo}>Pedido</div>
        <div className={styles.ordersStatus}>STATUS</div>
      </div>
      
      <div className={styles.ordersContainer}>
        {orders.map((order) => (
          <OrderItem
            key={order.id}
            orderId={order.id}
            productName={order.productName}
            productImage={order.productImage}
            status={order.status}
            statusText={order.statusText}
          />
        ))}
      </div>
    </div>
  );
};

export default OrdersList;