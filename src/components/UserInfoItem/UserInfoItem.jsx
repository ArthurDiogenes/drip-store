import React from 'react';
import styles from './UserInfoItem.module.css';

/**
 * UserInfoItem Component - Displays a label and value pair for user information
 * 
 * @param {Object} props
 * @param {string} props.label - Label for the information field
 * @param {string} props.value - Value of the information field
 * @returns {JSX.Element} A label-value pair component
 */
const UserInfoItem = ({ label, value }) => {
  return (
    <div className={styles.infoItem}>
      <span className={styles.label}>{label}:</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
};

export default UserInfoItem;