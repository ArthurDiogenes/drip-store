// src/components/layout/Header.jsx - FIXED VERSION
import { useState, useEffect, useRef } from "react";
import {
  Search,
  Menu,
  X,
  User,
  Package,
  Info,
  CreditCard,
  LogOut,
} from "lucide-react";
import miniCartIconPath from "/icons/mini-cart.svg";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { useCart } from "../../contexts/CartContext";

const Header = () => {
  // Hooks de Contexto e Navegação
  const { user, profile, loading, logoutUser } = useUser();
  // FIX: Get all cart data from context including cartItems
  const { cartCount, cartItems, cartSubtotal, refreshCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados da UI
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState("");

  // Referências DOM
  const cartButtonRef = useRef(null);
  const cartRef = useRef(null);
  const profileButtonRef = useRef(null);
  const profileModalRef = useRef(null);

  // --- EFEITOS ---

  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setCurrentPage("home");
    else if (
      path.startsWith("/produto") ||
      path === "/product-detail" ||
      path.startsWith("/produtos")
    )
      setCurrentPage("produtos");
    else if (path.startsWith("/categorias")) setCurrentPage("categorias");
    else if (path.startsWith("/meus-pedidos")) setCurrentPage("meus-pedidos");
    else if (path.startsWith("/minhas-informacoes"))
      setCurrentPage("minhas-informacoes");
    else if (path.startsWith("/metodos-pagamento"))
      setCurrentPage("metodos-pagamento");
    else if (path === "/carrinho") setCurrentPage("carrinho");
    else setCurrentPage("");
  }, [location.pathname]);

  // FIX: Listen for cart updates and refresh cart data
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('Cart update event received in Header');
      refreshCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [refreshCart]);

  useEffect(() => {
    function handleClickOutsideCart(event) {
      if (
        isCartOpen &&
        cartRef.current &&
        !cartRef.current.contains(event.target) &&
        cartButtonRef.current &&
        !cartButtonRef.current.contains(event.target)
      ) {
        setIsCartOpen(false);
      }
    }
    if (isCartOpen) document.addEventListener("click", handleClickOutsideCart);
    return () => document.removeEventListener("click", handleClickOutsideCart);
  }, [isCartOpen]);

  useEffect(() => {
    function handleClickOutsideProfileModal(event) {
      if (
        isProfileModalOpen &&
        profileModalRef.current &&
        !profileModalRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsProfileModalOpen(false);
      }
    }
    if (isProfileModalOpen)
      document.addEventListener("click", handleClickOutsideProfileModal);
    return () =>
      document.removeEventListener("click", handleClickOutsideProfileModal);
  }, [isProfileModalOpen]);

  // --- MANIPULADORES DE EVENTOS E FUNÇÕES AUXILIARES ---

  const handleLogout = async () => {
    if (logoutUser) {
      try {
        await logoutUser();
        navigate("/");
        setIsMenuOpen(false);
        setIsProfileModalOpen(false);
      } catch (error) {
        console.error("Erro ao fazer logout no Header:", error);
      }
    }
  };

  const closeAllPopovers = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsCartOpen(false);
    setIsFilterOpen(false);
    setIsProfileModalOpen(false);
  };

  const toggleMenu = () => {
    const currentlyOpen = isMenuOpen;
    closeAllPopovers();
    setIsMenuOpen(!currentlyOpen);
  };

  const toggleSearch = () => {
    const currentlyOpen = isSearchOpen;
    closeAllPopovers();
    setIsSearchOpen(!currentlyOpen);
  };

  const toggleCart = (e) => {
    if (e) e.stopPropagation();
    const currentlyOpen = isCartOpen;
    closeAllPopovers();
    setIsCartOpen(!currentlyOpen);
  };

  const toggleFilter = () => {
    const currentlyOpen = isFilterOpen;
    closeAllPopovers();
    setIsFilterOpen(!currentlyOpen);
  };

  const toggleProfileModal = (e) => {
    if (e) e.stopPropagation();
    const currentlyOpen = isProfileModalOpen;
    closeAllPopovers();
    setIsProfileModalOpen(!currentlyOpen);
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const getFirstName = () => {
    if (profile && profile.nome_completo) {
      return profile.nome_completo.split(" ")[0];
    }
    return "";
  };

  // FIX: Add function to handle cart clearing
  const handleClearCart = async () => {
    try {
      const { clearCart, getCart } = await import('../../services/cartService');
      const cartId = await getCart(user?.id);
      await clearCart(cartId);
      refreshCart();
      setIsCartOpen(false);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // --- RENDERIZAÇÃO DO COMPONENTE ---
  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-2">
        {/* Parte superior do header */}
        <div className="py-4 md:py-5 flex items-center">
          {/* Layout Mobile */}
          <div className="md:hidden grid grid-cols-12 items-center w-full">
            <div className="col-span-3 flex justify-start">
              <button
                onClick={toggleMenu}
                aria-label="Menu"
                className="bg-transparent border-none p-0"
              >
                <Menu size={24} className="text-pink-600" />
              </button>
            </div>
            <div className="col-span-6 flex justify-center">
              <Link
                to="/"
                className="flex items-center"
                onClick={() => {
                  setCurrentPage("home");
                  toggleMenu();
                }}
              >
                <img
                  src="/logos/logo-header.svg"
                  alt="Digital Store"
                  className="h-6"
                />
              </Link>
            </div>
            <div className="col-span-3 flex items-center justify-end space-x-5">
              <button
                onClick={toggleSearch}
                aria-label="Pesquisar"
                className="bg-transparent border-none p-0"
              >
                <Search size={24} className="text-pink-600" />
              </button>
              <div className="relative">
                <button
                  ref={cartButtonRef}
                  onClick={toggleCart}
                  aria-label="Carrinho"
                  className="bg-transparent border-none p-0 flex items-center justify-center relative"
                >
                  <img
                    src={miniCartIconPath}
                    alt="Carrinho"
                    className="w-6 h-6"
                  />
                  <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Layout Desktop */}
          <div className="hidden md:flex items-center justify-between w-full">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center"
                onClick={() => setCurrentPage("home")}
              >
                <img
                  src="/logos/logo-header.svg"
                  alt="Digital Store"
                  className="h-9"
                />
              </Link>
            </div>
            <div className="flex-1 max-w-2xl mx-auto px-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar produto..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  className="w-full pl-4 pr-10 py-2.5 rounded-md bg-gray-100 focus:outline-none text-gray-800 focus:placeholder-transparent"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Search className="text-gray-400 cursor-pointer" size={20} />
                </div>
              </div>
            </div>
            <div className="flex items-center">
              {loading ? (
                <div className="w-8 h-8 rounded-full border-2 border-pink-600 border-t-transparent animate-spin mr-6"></div>
              ) : user ? (
                <div className="relative mr-6">
                  <button
                    ref={profileButtonRef}
                    onClick={toggleProfileModal}
                    className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 transition-colors"
                    aria-label="Abrir menu do perfil"
                    type="button"
                  >
                    <User size={22} className="text-pink-600" />
                    <span className="text-sm">
                      Olá, <span className="font-medium">{getFirstName()}</span>
                    </span>
                  </button>
                  {isProfileModalOpen && (
                    <div
                      ref={profileModalRef}
                      className="absolute right-0 top-full mt-2 w-60 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-100"
                    >
                      <nav className="flex flex-col">
                        <Link
                          to="/meus-pedidos"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                          onClick={() => {
                            setCurrentPage("meus-pedidos");
                            closeAllPopovers();
                          }}
                        >
                          <Package size={18} className="opacity-75" />
                          <span>Meus pedidos</span>
                        </Link>
                        <Link
                          to="/minhas-informacoes"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                          onClick={() => {
                            setCurrentPage("minhas-informacoes");
                            closeAllPopovers();
                          }}
                        >
                          <Info size={18} className="opacity-75" />
                          <span>Minhas informações</span>
                        </Link>
                        <Link
                          to="/metodos-pagamento"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                          onClick={() => {
                            setCurrentPage("metodos-pagamento");
                            closeAllPopovers();
                          }}
                        >
                          <CreditCard size={18} className="opacity-75" />
                          <span>Métodos de Pagamento</span>
                        </Link>
                        <div className="px-2 my-1">
                          <hr className="border-gray-200" />
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 text-left px-4 py-2.5 text-sm text-gray-700 hover:text-pink-600 transition-colors focus:outline-none"
                          type="button"
                        >
                          <LogOut size={18} className="opacity-75" />
                          <span className="underline hover:no-underline">
                            Sair
                          </span>
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center mr-6">
                  <Link
                    to="/cadastro"
                    className="text-gray-700 text-sm hover:text-pink-600 transition-colors bg-transparent border-none underline mr-8"
                  >
                    Cadastre-se
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-md font-medium transition-colors bg-pink-600 text-white hover:bg-pink-700 py-2 px-8 inline-block text-center text-sm"
                  >
                    Entrar
                  </Link>
                </div>
              )}
              <div className="relative">
                <button
                  ref={cartButtonRef}
                  onClick={toggleCart}
                  aria-label="Carrinho"
                  className="bg-transparent border-none p-0 flex items-center justify-center relative"
                >
                  <img
                    src={miniCartIconPath}
                    alt="Carrinho"
                    className="w-6 h-6"
                  />
                  <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="md:hidden py-3 pb-5">
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar produto..."
                value={searchValue}
                onChange={handleSearchChange}
                className="w-full pl-4 pr-10 py-2.5 rounded-md bg-gray-100 focus:outline-none text-gray-800 focus:placeholder-transparent"
                autoFocus
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button className="bg-transparent border-none p-1">
                  <Search className="text-gray-400" size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        <nav className="hidden md:block">
          <div className="flex py-4 space-x-8">
            {["Home", "Produtos", "Categorias"].map((item) => {
              const path =
                item === "Home"
                  ? "/"
                  : `/${item.toLowerCase().replace(" ", "-")}`;
              const pageName = item.toLowerCase();
              return (
                <Link
                  key={item}
                  to={path}
                  onClick={() => setCurrentPage(pageName)}
                  className={`text-sm transition-colors hover:text-pink-600 ${currentPage === pageName
                    ? "text-pink-600 border-b-2 border-pink-600 pb-1 font-medium"
                    : "text-gray-700"
                    }`}
                >
                  {item}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
              <Link to="/" className="flex items-center" onClick={toggleMenu}>
                <img
                  src="/logos/logo-header.svg"
                  alt="Digital Store"
                  className="h-6"
                />
              </Link>
              <button
                onClick={toggleMenu}
                aria-label="Fechar Menu"
                className="bg-transparent border-none p-0"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="pt-4">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-2 mb-2">
                Navegar
              </p>
              <nav className="flex flex-col mb-6">
                {["Home", "Produtos", "Categorias"].map((item) => {
                  const path =
                    item === "Home"
                      ? "/"
                      : `/${item.toLowerCase().replace(" ", "-")}`;
                  const pageName = item.toLowerCase();
                  return (
                    <Link
                      key={item}
                      to={path}
                      onClick={() => {
                        setCurrentPage(pageName);
                        toggleMenu();
                      }}
                      className={`flex items-center space-x-3 px-2 py-2.5 text-base transition-colors hover:bg-pink-50 hover:text-pink-600 rounded-md ${currentPage === pageName
                        ? "text-pink-600 font-medium bg-pink-50"
                        : "text-gray-700"
                        }`}
                    >
                      <span>{item}</span>
                    </Link>
                  );
                })}
              </nav>

              <hr className="my-4 border-gray-200" />
              <div className="px-2">
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 rounded-full border-2 border-pink-600 border-t-transparent animate-spin"></div>
                  </div>
                ) : user ? (
                  <div className="text-left">
                    <Link
                      to="/minhas-informacoes"
                      onClick={() => {
                        setCurrentPage("minhas-informacoes");
                        toggleMenu();
                      }}
                      className="flex items-center space-x-3 mb-4 p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <User
                        size={28}
                        className="text-pink-600 flex-shrink-0 border border-pink-100 rounded-full p-1"
                      />
                      <div className="flex flex-col">
                        <span className="text-base font-medium text-gray-800">
                          Olá, {getFirstName()}
                        </span>
                      </div>
                    </Link>

                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-2 mb-2">
                      Minha Conta
                    </p>
                    <nav className="flex flex-col space-y-1 mb-6">
                      <Link
                        to="/meus-pedidos"
                        className="flex items-center space-x-3 px-2 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-md transition-colors"
                        onClick={() => {
                          setCurrentPage("meus-pedidos");
                          toggleMenu();
                        }}
                      >
                        <Package size={20} className="opacity-75" />
                        <span>Meus pedidos</span>
                      </Link>
                      <Link
                        to="/minhas-informacoes"
                        className="flex items-center space-x-3 px-2 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-md transition-colors"
                        onClick={() => {
                          setCurrentPage("minhas-informacoes");
                          toggleMenu();
                        }}
                      >
                        <Info size={20} className="opacity-75" />
                        <span>Minhas informações</span>
                      </Link>
                      <Link
                        to="/metodos-pagamento"
                        className="flex items-center space-x-3 px-2 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-md transition-colors"
                        onClick={() => {
                          setCurrentPage("metodos-pagamento");
                          toggleMenu();
                        }}
                      >
                        <CreditCard size={20} className="opacity-75" />
                        <span>Métodos de Pagamento</span>
                      </Link>
                    </nav>
                    <hr className="my-3 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2.5 rounded-md font-medium transition-colors bg-pink-600 text-white hover:bg-pink-700 py-3 px-4 text-sm"
                      type="button"
                    >
                      <LogOut size={18} />
                      <span>Sair</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link
                      to="/login"
                      onClick={toggleMenu}
                      className="w-full block text-center rounded-md font-medium transition-colors bg-pink-600 text-white hover:bg-pink-700 py-3 text-sm"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/cadastro"
                      onClick={toggleMenu}
                      className="w-full block text-center text-sm text-gray-700 hover:text-pink-600 transition-colors underline py-2"
                    >
                      Não tem uma conta? Cadastre-se
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIX: Updated cart popup to show actual cart items */}
      {isCartOpen && (
        <div
          ref={cartRef}
          className="absolute right-4 md:right-8 top-14 md:top-16 bg-white rounded-lg shadow-lg z-50 w-72 md:w-80"
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Meu Carrinho
            </h3>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {cartItems && cartItems.length > 0 ? (
                cartItems.slice(0, 3).map((item, index) => (
                  <div key={item.id} className={`flex items-center gap-3 ${index < cartItems.length - 1 ? 'border-b border-gray-200 pb-3' : ''}`}>
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
                      <img
                        src={item.produto.imagemUrl}
                        alt={item.produto.nome}
                        className="object-contain max-h-full max-w-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '../images/products/produc-image-0.png';
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
                        {item.produto.nome}
                      </h4>
                      {item.cor && <p className="text-xs text-gray-500 mt-0.5">Cor: {item.cor}</p>}
                      {item.tamanho && <p className="text-xs text-gray-500">Tamanho: {item.tamanho}</p>}
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-sm text-pink-600 font-semibold">
                          R$ {item.produto.precoAtual.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs text-gray-500">{item.quantidade} unid.</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Seu carrinho está vazio
                </div>
              )}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-200">
              <div className="flex justify-between mb-4">
                <span className="text-sm font-medium text-gray-800">
                  Valor total:
                </span>
                <span className="text-base font-semibold text-pink-600">
                  R$ {cartSubtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex flex-col space-y-2.5">
                <Link
                  to="/carrinho"
                  onClick={() => {
                    setCurrentPage("carrinho");
                    closeAllPopovers();
                  }}
                  className="w-full bg-pink-600 text-white py-2.5 px-4 rounded-md hover:bg-pink-700 transition-colors text-sm font-medium text-center"
                >
                  Ver Carrinho
                </Link>
                <button 
                  onClick={handleClearCart}
                  className="w-full py-2 text-sm text-gray-600 hover:text-pink-600 active:text-pink-600 transition-colors underline"
                >
                  Esvaziar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end md:hidden">
          <div className="bg-white h-full w-full max-w-xs overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-medium text-lg text-gray-800">
                  Filtrar por
                </h3>
                <button
                  onClick={toggleFilter}
                  className="bg-transparent border-none p-0"
                  aria-label="Fechar Filtros"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Marca</h4>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Categoria</h4>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Gênero</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;