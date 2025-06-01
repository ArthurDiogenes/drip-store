import { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { getCurrentUser, signOut } from '../services/authService';

/**
 * @returns {Object} Authentication utilities and state
 */
const useAuth = () => {
  const { user, profile, loading, setUser, setProfile } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user && !loading) {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user, loading, setUser]);

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setUser(null);
      setProfile(null);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return {
    user,
    profile,
    isLoading: isLoading || loading,
    isAuthenticated,
    logout,
  };
};

export default useAuth;