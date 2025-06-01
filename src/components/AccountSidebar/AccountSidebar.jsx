import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './AccountSidebar.module.css';

const AccountSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { 
      path: '/meus-pedidos', 
      label: 'Meus Pedidos' 
    },
    { 
      path: '/minhas-informacoes', 
      label: 'Minhas Informações' 
    },
    { 
      path: '/metodos-pagamento', 
      label: 'Métodos de Pagamento' 
    }
  ];

  return (
    <div className={styles.sidebar}>
      <nav>
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.path} className={styles.navItem}>
              <Link 
                to={item.path} 
                className={`${styles.navLink} ${currentPath === item.path ? styles.active : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AccountSidebar;