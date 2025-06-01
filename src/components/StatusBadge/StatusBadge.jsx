import React from 'react';
import styles from './StatusBadge.module.css';

/**
 * StatusBadge Component - Displays order status with appropriate styling
 * 
 * @param {string} status - The status text to display
 * @param {string} type - The type of status (transit, completed, canceled)
 * @returns {JSX.Element} A styled status badge
 */
const StatusBadge = ({ status, type }) => {
  const getStatusClass = () => {
    switch (type) {
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

StatusBadge.Transit = () => (
  <StatusBadge status="Produto em trânsito" type="transit" />
);

StatusBadge.Completed = () => (
  <StatusBadge status="Finalizado" type="completed" />
);

StatusBadge.Canceled = () => (
  <StatusBadge status="Cancelado" type="canceled" />
);

export default StatusBadge;