import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home/Home.jsx";
import ProductDetail from "../pages/ProductDetail/ProductDetail.jsx";
import ProductList from "../pages/ProductList/ProductList.jsx";
import Checkout from "../pages/Checkout/Checkout.jsx";
import Cart from "../pages/Cart/Cart.jsx";
import Login from "../pages/Auth/Login.jsx";
import OrderSuccess from '../pages/OrderSuccess/OrderSuccess.jsx';
import Register from "../pages/Auth/Register.jsx";
import RegisterForm from "../pages/Auth/RegisterForm.jsx";
import Orders from "../pages/Orders/Orders.jsx";
import UserInfo from "../pages/UserInfo/UserInfo.jsx";
import EditUserInfo from "../pages/EditUserInfo/EditUserInfo.jsx";
import PaymentMethods from "../pages/PaymentMethods/PaymentMethods.jsx";
import AddPaymentMethod from "../pages/AddPaymentMethod/AddPaymentMethod.jsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import { useUser } from "../contexts/UserContext.jsx";

const NotFound = () => (
  <div className="container mx-auto px-4 py-16 text-center text-black flex flex-col items-center justify-center h-screen">
    <h1 className="text-3xl font-bold mb-4 text-black">
      404 - Página não encontrada
    </h1>
    <p className="mb-8">
      A página que você está procurando não existe ou foi movida.
    </p>
    <a
      href="/"
      className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
    >
      Voltar para a página inicial
    </a>
  </div>
);

const AppRoutes = () => {
  const { user, loading } = useUser();

  const RedirectIfAuthenticated = ({ children, redirectTo = "/" }) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
        </div>
      );
    }

    if (user) {
      return <Navigate to={redirectTo} replace />;
    }

    return children;
  };

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/produtos" element={<ProductList />} />
      <Route path="/produto/:id" element={<ProductDetail />} />
      <Route path="/produto" element={<ProductDetail />} />
      
      {/* Rotas de Autenticação - redireciona para Home se já logado */}
      <Route path="/login" element={
        <RedirectIfAuthenticated>
          <Login />
        </RedirectIfAuthenticated>
      } />
      <Route path="/cadastro" element={
        <RedirectIfAuthenticated>
          <Register />
        </RedirectIfAuthenticated>
      } />
      <Route path="/cadastro/formulario" element={
        <RedirectIfAuthenticated>
          <RegisterForm />
        </RedirectIfAuthenticated>
      } />
      
      {/* Rotas protegidas - Requerem Autenticação */}
      <Route element={<ProtectedRoute />}>
        <Route path="/carrinho" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/compra-realizada" element={<OrderSuccess />} />
        <Route path="/meus-pedidos" element={<Orders />} />
        <Route path="/minhas-informacoes" element={<UserInfo />} />
        <Route path="/editar-informacoes" element={<EditUserInfo />} />
        <Route path="/metodos-pagamento" element={<PaymentMethods />} />
        <Route path="/adicionar-cartao" element={<AddPaymentMethod />} />
        <Route path="/perfil" element={<UserInfo />} />
      </Route>

      {/* 404 - Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;