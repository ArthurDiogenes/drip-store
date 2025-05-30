import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import AccountSidebar from '../../components/AccountSidebar/AccountSidebar';
import OrdersList from '../../components/OrdersList/OrdersList';
import { useUser } from '../../contexts/UserContext';
import { getUserOrders } from '../../services/orderService';
import styles from './Orders.module.css';

const Orders = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userOrders = await getUserOrders(user.id);
        setOrders(userOrders);

      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Erro ao carregar pedidos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className={styles.ordersPage}>
            <div className={styles.sidebarContainer}>
              <AccountSidebar />
            </div>
            <div className={styles.contentContainer}>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-md p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="w-20 h-6 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className={styles.ordersPage}>
            <div className={styles.sidebarContainer}>
              <AccountSidebar />
            </div>
            <div className={styles.contentContainer}>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😔</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Ops! Algo deu errado</h1>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className={styles.ordersPage}>
          <div className={styles.sidebarContainer}>
            <AccountSidebar />
          </div>

          <div className={styles.contentContainer}>
            <OrdersList orders={orders} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;