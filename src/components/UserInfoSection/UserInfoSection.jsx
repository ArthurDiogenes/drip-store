import React from 'react';
import styles from './UserInfoSection.module.css';

/**
 * UserInfoSection Component - Container for a group of related user information
 * 
 * @param {Object} props
 * @param {string} props.title - Title of the information section
 * @param {ReactNode} props.children - Child components to be rendered inside the section
 * @param {ReactNode} [props.actionButton] - Optional action button (like Edit)
 * @returns {JSX.Element} A section container for user information
 */
const UserInfoSection = ({ title, children, actionButton }) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {actionButton && (
          <div className={styles.actionButton}>
            {actionButton}
          </div>
        )}
      </div>
      
      <div className={styles.sectionContent}>
        {children}
      </div>
    </div>
  );
};

export default UserInfoSection;