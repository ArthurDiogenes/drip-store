import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import AppRoutes from './routes/AppRoutes';
import { UserProvider } from './contexts/UserContext';
import { CartProvider } from './contexts/CartContext';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <Router>
          <ScrollToTop /> {/* Add this component */}
          <AppRoutes />
        </Router>
      </CartProvider>
    </UserProvider>
  );
}

export default App;