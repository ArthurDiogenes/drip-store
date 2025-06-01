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
  ChevronDown,
} from "lucide-react";
import miniCartIconPath from "/icons/mini-cart.svg";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { useCart } from "../../contexts/CartContext";
import { supabase } from "../../services/supabase";
import { getCategories } from "../../services/productService";

const Header = () => {
  const { user, profile, loading, logoutUser } = useUser();
  const { cartCount, cartItems, cartSubtotal, refreshCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState("");

  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [navCategories, setNavCategories] = useState([]);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isMobileProductSubMenuOpen, setIsMobileProductSubMenuOpen] =
    useState(false);

  const productDropdownRef = useRef(null);
  const productButtonRef = useRef(null);
  const cartButtonRef = useRef(null);
  const cartRef = useRef(null);
  const profileButtonRef = useRef(null);
  const profileModalRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const createWordVariations = (word) => {
    const variations = [word];
    const normalizedWord = normalizeText(word);
    if (normalizedWord.endsWith("s") && normalizedWord.length > 3) {
      variations.push(normalizedWord.slice(0, -1));
    }
    if (normalizedWord.endsWith("es") && normalizedWord.length > 4) {
      variations.push(normalizedWord.slice(0, -2));
    }
    if (!normalizedWord.endsWith("s")) {
      variations.push(normalizedWord + "s");
      if (!/[aeiou]$/.test(normalizedWord)) {
        variations.push(normalizedWord + "es");
      }
    }
    if (normalizedWord.endsWith("ao")) {
      variations.push(normalizedWord.slice(0, -2) + "oes");
    }
    if (normalizedWord.endsWith("oes")) {
      variations.push(normalizedWord.slice(0, -3) + "ao");
    }
    const specialCases = {
      tenis: ["tenis", "tennis"],
      tennis: ["tenis", "tennis"],
      bone: ["bone", "bones", "boné", "bonés"],
      bones: ["bone", "bones", "boné", "bonés"],
      calca: ["calca", "calcas", "calça", "calças"],
      calcas: ["calca", "calcas", "calça", "calças"],
      camisa: ["camisa", "camisas", "camiseta", "camisetas"],
      camiseta: ["camisa", "camisas", "camiseta", "camisetas"],
      headphone: ["headphone", "headphones", "fone", "fones"],
      headphones: ["headphone", "headphones", "fone", "fones"],
    };
    if (specialCases[normalizedWord]) {
      variations.push(...specialCases[normalizedWord]);
    }
    return [...new Set(variations)];
  };

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    try {
      setLoadingSuggestions(true);
      const normalizedQuery = normalizeText(query);
      const [productsResponse, categoriesResponse] = await Promise.all([
        supabase
          .from("produtos")
          .select(
            `id, nome, slug, preco_promocional, preco_original, categoria_id (nome)`
          )
          .eq("ativo", true)
          .limit(50),
        supabase.from("categorias").select("id, nome, slug").eq("ativo", true),
      ]);
      if (productsResponse.error) throw productsResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;
      const products = productsResponse.data || [];
      const categories = categoriesResponse.data || [];
      const queryWords = normalizedQuery
        .split(" ")
        .filter((word) => word.length > 1)
        .flatMap((word) => createWordVariations(word));
      const filteredProducts = products.filter((product) => {
        const normalizedProductName = normalizeText(product.nome);
        const normalizedCategoryName = product.categoria_id
          ? normalizeText(product.categoria_id.nome)
          : "";
        return queryWords.some(
          (word) =>
            normalizedProductName.includes(word) ||
            normalizedCategoryName.includes(word)
        );
      });
      const matchingCategories = categories.filter((category) => {
        const normalizedCategoryName = normalizeText(category.nome);
        return queryWords.some((word) => normalizedCategoryName.includes(word));
      });
      if (matchingCategories.length > 0) {
        const categoryProducts = products.filter(
          (product) =>
            product.categoria_id &&
            matchingCategories.some(
              (cat) => cat.nome === product.categoria_id.nome
            )
        );
        categoryProducts.forEach((product) => {
          if (!filteredProducts.find((p) => p.id === product.id)) {
            filteredProducts.push(product);
          }
        });
      }
      const sortedProducts = filteredProducts.sort((a, b) => {
        const aNormalized = normalizeText(a.nome);
        const bNormalized = normalizeText(b.nome);
        const aStartsWithQuery = queryWords.some((word) =>
          aNormalized.startsWith(word)
        );
        const bStartsWithQuery = queryWords.some((word) =>
          bNormalized.startsWith(word)
        );
        if (aStartsWithQuery && !bStartsWithQuery) return -1;
        if (!aStartsWithQuery && bStartsWithQuery) return 1;
        if (
          aNormalized.includes(normalizedQuery) &&
          !bNormalized.includes(normalizedQuery)
        )
          return -1;
        if (
          !aNormalized.includes(normalizedQuery) &&
          bNormalized.includes(normalizedQuery)
        )
          return 1;
        return 0;
      });
      setSearchSuggestions(sortedProducts.slice(0, 8));
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
      setSearchSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    const fetchNavCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        if (fetchedCategories) {
          setNavCategories(
            fetchedCategories.filter((cat) => cat.slug && cat.nome)
          );
        }
      } catch (error) {
        console.error("Error fetching categories for header:", error);
      }
    };
    fetchNavCategories();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setCurrentPage("home");
    else if (path.startsWith("/produtos")) setCurrentPage("produtos");
    else if (path.startsWith("/product-detail")) setCurrentPage("produtos");
    else if (path.startsWith("/meus-pedidos")) setCurrentPage("meus-pedidos");
    else if (path.startsWith("/minhas-informacoes"))
      setCurrentPage("minhas-informacoes");
    else if (path.startsWith("/metodos-pagamento"))
      setCurrentPage("metodos-pagamento");
    else if (path === "/carrinho") setCurrentPage("carrinho");
    else setCurrentPage("");
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleCartUpdate = () => {
      refreshCart();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [refreshCart]);

  useEffect(() => {
    if (
      !location.pathname.includes("/produtos") ||
      !location.search.includes("q=")
    ) {
      setSearchValue("");
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [location]);

  useEffect(() => {
    const handlePopState = () => {
      setSearchValue("");
      setSearchSuggestions([]);
      setShowSuggestions(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (searchValue.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(searchValue);
      }, 300);
    } else {
      setSearchSuggestions([]);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showSuggestions &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
      if (
        isProductDropdownOpen &&
        productDropdownRef.current &&
        !productDropdownRef.current.contains(event.target) &&
        productButtonRef.current &&
        !productButtonRef.current.contains(event.target)
      ) {
        setIsProductDropdownOpen(false);
      }
    }
    if (showSuggestions || isProductDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions, isProductDropdownOpen]);

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

  const closeAllPopovers = (keepProductDropdown = false) => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsCartOpen(false);
    setIsFilterOpen(false);
    setIsProfileModalOpen(false);
    if (!keepProductDropdown) {
      setIsProductDropdownOpen(false);
    }
  };

  const toggleMenu = () => {
    const currentlyOpen = isMenuOpen;
    closeAllPopovers();
    setIsMenuOpen(!currentlyOpen);
    setIsMobileProductSubMenuOpen(false);
  };

  const toggleSearch = () => {
    const currentlyOpen = isSearchOpen;
    closeAllPopovers();
    setIsSearchOpen(!currentlyOpen);
  };

  const toggleCart = (e) => {
    if (e) e.stopPropagation();
    const currentlyOpen = isCartOpen;
    closeAllPopovers(true);
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
    closeAllPopovers(true);
    setIsProfileModalOpen(!currentlyOpen);
  };

  const toggleProductDropdown = (e) => {
    if (e) e.stopPropagation();
    if (isProfileModalOpen) setIsProfileModalOpen(false);
    if (isCartOpen) setIsCartOpen(false);
    setIsProductDropdownOpen((prev) => !prev);
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearch = (e, customQuery = null) => {
    e?.preventDefault();
    const queryToSearch = customQuery || searchValue.trim();
    if (queryToSearch) {
      closeAllPopovers();
      setShowSuggestions(false);
      const searchUrl = `/produtos?q=${encodeURIComponent(queryToSearch)}`;
      if (location.pathname === "/produtos") {
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.set("q", queryToSearch);
        navigate(`/produtos?${newSearchParams.toString()}`, { replace: true });
      } else {
        navigate(searchUrl);
      }
      setTimeout(() => {
        setSearchValue("");
        setSearchSuggestions([]);
      }, 100);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchValue(suggestion.nome);
    setShowSuggestions(false);
    handleSearch(null, suggestion.nome);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  const getFirstName = () => {
    if (profile && profile.nome_completo) {
      return profile.nome_completo.split(" ")[0];
    }
    return "";
  };

  const handleClearCart = async () => {
    try {
      const { clearCart, getCart } = await import("../../services/cartService");
      const cartId = await getCart(user?.id);
      await clearCart(cartId);
      refreshCart();
      setIsCartOpen(false);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const handleCategoryNavigation = (slug) => {
    navigate(`/produtos?categoria=${slug}`);
    setCurrentPage("produtos");
    closeAllPopovers();
    setIsMobileProductSubMenuOpen(false);
    if (isMenuOpen) toggleMenu();
  };

  const handleAllProductsNavigation = () => {
    navigate("/produtos");
    setCurrentPage("produtos");
    closeAllPopovers();
    setIsMobileProductSubMenuOpen(false);
    if (isMenuOpen) toggleMenu();
  };

  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 right-0 z-40">
      {/* Restante do JSX do Header permanece o mesmo */}
      {/* ... (todo o JSX interno do header que você já tem) ... */}
      <div className="container mx-auto px-4 py-2">
        <div className="py-4 md:py-5 flex items-center">
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
                  if (isMenuOpen) toggleMenu();
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
              <div ref={searchContainerRef} className="relative">
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    placeholder={
                      location.search.includes("q=")
                        ? "Nova pesquisa..."
                        : "Pesquisar produto..."
                    }
                    value={searchValue}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchKeyPress}
                    onFocus={() => searchValue && setShowSuggestions(true)}
                    className="w-full pl-4 pr-20 py-2.5 rounded-md bg-gray-100 focus:outline-none text-gray-800 focus:placeholder-transparent"
                  />
                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchValue("");
                        setSearchSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Limpar busca"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 bg-transparent border-none"
                    aria-label="Pesquisar"
                  >
                    <Search
                      className="text-gray-400 cursor-pointer hover:text-gray-600"
                      size={20}
                    />
                  </button>
                </form>
                {showSuggestions && searchValue && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    {loadingSuggestions ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                      </div>
                    ) : searchSuggestions.length > 0 ? (
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
                          Sugestões
                        </div>
                        {searchSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group"
                          >
                            <div>
                              <div className="text-sm text-gray-900">
                                {suggestion.nome}
                              </div>
                              <div className="text-xs text-gray-500">
                                {suggestion.categoria_id && (
                                  <span className="mr-2">
                                    {suggestion.categoria_id.nome}
                                  </span>
                                )}
                                R${" "}
                                {(
                                  suggestion.preco_promocional ||
                                  suggestion.preco_original
                                )
                                  .toFixed(2)
                                  .replace(".", ",")}
                              </div>
                            </div>
                            <Search className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Nenhuma sugestão encontrada
                      </div>
                    )}
                  </div>
                )}
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
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Pesquisar produto..."
                value={searchValue}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                onFocus={() => searchValue && setShowSuggestions(true)}
                className="w-full pl-4 pr-10 py-2.5 rounded-md bg-gray-100 focus:outline-none text-gray-800 focus:placeholder-transparent"
                autoFocus
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-3 bg-transparent border-none p-1"
                aria-label="Pesquisar"
              >
                <Search className="text-gray-400" size={20} />
              </button>
            </form>
            {showSuggestions && searchValue && (
              <div className="mt-2 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                {loadingSuggestions ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                  </div>
                ) : searchSuggestions.length > 0 ? (
                  <div className="py-1">
                    {searchSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50"
                      >
                        <div className="text-sm text-gray-900">
                          {suggestion.nome}
                        </div>
                        <div className="text-xs text-gray-500">
                          {suggestion.categoria_id && (
                            <span className="mr-2">
                              {suggestion.categoria_id.nome}
                            </span>
                          )}
                          R${" "}
                          {(
                            suggestion.preco_promocional ||
                            suggestion.preco_original
                          )
                            .toFixed(2)
                            .replace(".", ",")}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Nenhuma sugestão encontrada
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <nav className="hidden md:block">
          <div className="flex py-4 space-x-8">
            <Link
              to="/"
              onClick={() => {
                setCurrentPage("home");
                setIsProductDropdownOpen(false);
              }}
              className={`text-sm transition-colors hover:text-pink-600 ${
                currentPage === "home"
                  ? "text-pink-600 border-b-2 border-pink-600 pb-1 font-medium"
                  : "text-gray-700"
              }`}
            >
              Home
            </Link>

            <div className="relative" ref={productDropdownRef}>
              <button
                ref={productButtonRef}
                onClick={toggleProductDropdown}
                className={`flex items-center text-sm transition-colors hover:text-pink-600 ${
                  currentPage === "produtos" || isProductDropdownOpen
                    ? "text-pink-600 border-b-2 border-pink-600 pb-1 font-medium"
                    : "text-gray-700"
                }`}
              >
                Produtos
                <ChevronDown
                  size={16}
                  className={`ml-1 transition-transform duration-200 ${
                    isProductDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {isProductDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-md shadow-xl py-1 z-50 border border-gray-100">
                  <button
                    onClick={handleAllProductsNavigation}
                    className="block w-full text-left px-4 py-2.5 text-sm font-medium text-pink-600 hover:bg-pink-50 transition-colors"
                  >
                    Ver Todos os Produtos
                  </button>
                  <div className="px-2 my-1">
                    <hr className="border-gray-200" />
                  </div>
                  {navCategories.length > 0 ? (
                    navCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryNavigation(category.slug)}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                      >
                        {category.nome}
                      </button>
                    ))
                  ) : (
                    <span className="block px-4 py-2.5 text-sm text-gray-400">
                      Nenhuma categoria
                    </span>
                  )}
                </div>
              )}
            </div>
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
              <nav className="flex flex-col mb-2">
                <Link
                  to="/"
                  onClick={() => {
                    setCurrentPage("home");
                    toggleMenu();
                  }}
                  className={`flex items-center space-x-3 px-2 py-2.5 text-base transition-colors hover:bg-pink-50 hover:text-pink-600 rounded-md ${
                    currentPage === "home" && !isMobileProductSubMenuOpen
                      ? "text-pink-600 font-medium bg-pink-50"
                      : "text-gray-700"
                  }`}
                >
                  <span>Home</span>
                </Link>

                <div>
                  <button
                    onClick={() =>
                      setIsMobileProductSubMenuOpen(!isMobileProductSubMenuOpen)
                    }
                    className={`w-full flex items-center justify-between space-x-3 px-2 py-2.5 text-base transition-colors hover:bg-pink-50 hover:text-pink-600 rounded-md ${
                      currentPage === "produtos" || isMobileProductSubMenuOpen
                        ? "text-pink-600 font-medium bg-pink-50"
                        : "text-gray-700"
                    }`}
                  >
                    <span>Produtos</span>
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-200 ${
                        isMobileProductSubMenuOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isMobileProductSubMenuOpen && (
                    <div className="pl-4 mt-1 border-l-2 border-pink-100">
                      <Link
                        to="/produtos"
                        onClick={handleAllProductsNavigation}
                        className="block px-2 py-2 text-sm font-medium text-pink-500 hover:bg-pink-50 rounded-md"
                      >
                        Ver Todos os Produtos
                      </Link>
                      {navCategories.length > 0 ? (
                        navCategories.map((category) => (
                          <Link
                            key={category.id}
                            to={`/produtos?categoria=${category.slug}`}
                            onClick={() =>
                              handleCategoryNavigation(category.slug)
                            }
                            className="block px-2 py-2 text-sm text-gray-600 hover:bg-pink-50 hover:text-pink-500 rounded-md"
                          >
                            {category.nome}
                          </Link>
                        ))
                      ) : (
                        <span className="block px-2 py-2 text-sm text-gray-400">
                          Nenhuma categoria
                        </span>
                      )}
                    </div>
                  )}
                </div>
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
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 ${
                      index < cartItems.length - 1
                        ? "border-b border-gray-200 pb-3"
                        : ""
                    }`}
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
                      <img
                        src={item.produto.imagemUrl}
                        alt={item.produto.nome}
                        className="object-contain max-h-full max-w-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "../images/products/produc-image-0.png";
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
                        {item.produto.nome}
                      </h4>
                      {item.cor && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Cor: {item.cor}
                        </p>
                      )}
                      {item.tamanho && (
                        <p className="text-xs text-gray-500">
                          Tamanho: {item.tamanho}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-sm text-pink-600 font-semibold">
                          R${" "}
                          {item.produto.precoAtual.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.quantidade} unid.
                        </span>
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
                  R$ {cartSubtotal.toFixed(2).replace(".", ",")}
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
