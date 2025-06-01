import React from 'react';
import styles from './StatusBadge.module.css';

const StatusBadge = ({ status, type }) => {
  const getStatusClass = () => {
    switch (type) {
      case 'pending':
        return styles.pending;
      case 'processing':
        return styles.processing;
      case 'transit':
        return styles.transit;
      case 'completed':
        return styles.completed;
      case 'canceled':
        return styles.canceled;
      default:
        return styles.default;
    }
  };

  return (
    <span className={`${styles.badge} ${getStatusClass()}`}>
      {status}
    </span>
  );
};

StatusBadge.Pending = () => (
  <StatusBadge status="Aguardando Pagamento" type="pending" />
);

StatusBadge.Processing = () => (
  <StatusBadge status="Em Preparação" type="processing" />
);

StatusBadge.Transit = () => (
  <StatusBadge status="Em Trânsito" type="transit" />
);

StatusBadge.Completed = () => (
  <StatusBadge status="Entregue" type="completed" />
);

StatusBadge.Canceled = () => (
  <StatusBadge status="Cancelado" type="canceled" />
);

export default StatusBadge;