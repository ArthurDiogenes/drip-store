// src/pages/ProductList/ProductList.jsx
import { useState, useEffect } from "react";
import { ChevronRight, X, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import Styles from "./ProductList.module.css";

// Importação de componentes
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import ProductCard from "../../components/ProductCard/ProductCard";

const ProductList = () => {
  // Estados para controle de filtros e produtos
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    colors: [],
    brands: [],
    categories: [],
    price: null,
    gender: [],
    condition: null,
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulação de carregamento de produtos
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      // Simulando dados de produto
      setTimeout(() => {
        const mockProducts = Array(12)
          .fill()
          .map((_, index) => ({
            id: index + 1,
            name: `Tênis Nike Revolution 6 Next Nature Masculino`,
            originalPrice: 319.0,
            salePrice: 219.0,
            discount: "50% OFF",
            imageUrl: "/images/products/produc-image-7.png", // Ajuste o caminho conforme sua estrutura
            gender: "Masculino",
            isOnSale: index % 3 === 0, // Alguns produtos com desconto
          }));

        setProducts(mockProducts);
        setLoading(false);
      }, 800); // Simula um tempo de carregamento
    };

    fetchProducts();
  }, []);

  // Função para formatar os preços no formato brasileiro
  const formatPrice = (price) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  // Função para lidar com a abertura/fechamento do filtro no mobile
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Função para aplicar um filtro
  const handleFilterChange = (category, value) => {
    setActiveFilters((prev) => {
      const updated = { ...prev };

      // Lidar com arrays (checkboxes)
      if (Array.isArray(updated[category])) {
        if (updated[category].includes(value)) {
          updated[category] = updated[category].filter(
            (item) => item !== value
          );
        } else {
          updated[category] = [...updated[category], value];
        }
      }
      // Lidar com valores únicos (radio buttons)
      else {
        updated[category] = updated[category] === value ? null : value;
      }

      return updated;
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-pink-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-900 font-medium">Produtos</span>
          </div>

          {/* Título da página com contador de resultados */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-medium">Resultados para "Tênis"</h1>
            <span className="text-sm text-gray-500">
              {products.length} produtos
            </span>
          </div>

          {/* Filtro mobile - botão para abrir */}
          <div className="md:hidden mb-4">
            <button
              onClick={toggleFilter}
              className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700"
            >
              <Filter size={18} className="mr-2" />
              <span>Filtrar</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar de filtros para desktop */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-white rounded-md shadow-sm p-4">
                <h2 className="font-medium mb-4">Filtrar por</h2>

                {/* Filtro por cor
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Cores</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "bg-black",
                      "bg-blue-500",
                      "bg-red-500",
                      "bg-green-500",
                      "bg-yellow-500",
                      "bg-purple-500",
                    ].map((color, index) => (
                      <button
                        key={index}
                        className={`w-6 h-6 rounded-full ${color} border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500`}
                        aria-label={`Cor ${index + 1}`}
                        onClick={() => handleFilterChange("colors", color)}
                      />
                    ))}
                  </div>
                </div> */}

                {/* Filtro por marca */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Marca</h3>
                  <div className="space-y-2">
                    {["Adidas", "Balenciaga", "K-Swiss", "Nike", "Puma"].map(
                      (brand) => (
                        <label
                          key={brand}
                          className="flex items-center text-sm"
                        >
                          <input
                            type="checkbox"
                            className="mr-2 h-4 w-4 rounded text-pink-600 focus:ring-pink-500"
                            checked={activeFilters.brands.includes(brand)}
                            onChange={() => handleFilterChange("brands", brand)}
                          />
                          {brand}
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* Filtro por categoria */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Categoria</h3>
                  <div className="space-y-2">
                    {["Esporte e lazer", "Casual", "Utilitário", "Corrida"].map(
                      (category) => (
                        <label
                          key={category}
                          className="flex items-center text-sm"
                        >
                          <input
                            type="checkbox"
                            className="mr-2 h-4 w-4 rounded text-pink-600 focus:ring-pink-500"
                            checked={activeFilters.categories.includes(
                              category
                            )}
                            onChange={() =>
                              handleFilterChange("categories", category)
                            }
                          />
                          {category}
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* Filtro por preço */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Preço</h3>
                  <div className="space-y-2">
                    {[
                      "Até R$50",
                      "R$50 a R$100",
                      "R$100 a R$200",
                      "Acima de R$200",
                    ].map((priceRange) => (
                      <label
                        key={priceRange}
                        className="flex items-center text-sm"
                      >
                        <input
                          type="radio"
                          name="price"
                          className="mr-2 h-4 w-4 text-pink-600 focus:ring-pink-500"
                          checked={activeFilters.price === priceRange}
                          onChange={() =>
                            handleFilterChange("price", priceRange)
                          }
                        />
                        {priceRange}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtro por gênero */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Gênero</h3>
                  <div className="space-y-2">
                    {["Masculino", "Feminino", "Unisex"].map((gender) => (
                      <label key={gender} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          className="mr-2 h-4 w-4 rounded text-pink-600 focus:ring-pink-500"
                          checked={activeFilters.gender.includes(gender)}
                          onChange={() => handleFilterChange("gender", gender)}
                        />
                        {gender}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtro por estado */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Estado</h3>
                  <div className="space-y-2">
                    {["Novo", "Usado"].map((condition) => (
                      <label
                        key={condition}
                        className="flex items-center text-sm"
                      >
                        <input
                          type="radio"
                          name="condition"
                          className="mr-2 h-4 w-4 text-pink-600 focus:ring-pink-500"
                          checked={activeFilters.condition === condition}
                          onChange={() =>
                            handleFilterChange("condition", condition)
                          }
                        />
                        {condition}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Grid de produtos */}
            <div className="flex-grow">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[...Array(9)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-md shadow-sm p-4 h-80"
                    ></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-md shadow-sm overflow-hidden relative"
                    >
                      {product.isOnSale && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium py-1 px-2 rounded">
                          {product.discount}
                        </div>
                      )}
                      <Link to={`/produto/${product.id}`} className="block">
                        <div className="p-4">
                          <div className="aspect-w-1 aspect-h-1 bg-gray-100 mb-4 flex items-center justify-center">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="object-contain w-full h-40"
                            />
                          </div>
                          <h3 className="text-sm font-medium text-gray-800 mb-1">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <div>
                              {product.isOnSale && (
                                <span className="text-xs text-gray-500 line-through mr-2">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                              <span className="text-sm font-medium text-pink-600">
                                {formatPrice(product.salePrice)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Filtro mobile - panel lateral */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-medium">Filtrar por</h2>
                <button onClick={toggleFilter} className="text-gray-500">
                  <X size={24} />
                </button>
              </div>

              {/* Filtros mobile - mesmo conteúdo da sidebar desktop */}
              {/* Filtro por cor
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Cores</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "bg-black",
                    "bg-blue-500",
                    "bg-red-500",
                    "bg-green-500",
                    "bg-yellow-500",
                    "bg-purple-500",
                  ].map((color, index) => (
                    <button
                      key={index}
                      className={`w-6 h-6 rounded-full ${color} border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500`}
                      aria-label={`Cor ${index + 1}`}
                      onClick={() => handleFilterChange("colors", color)}
                    />
                  ))}
                </div>
              </div> */}

              {/* Filtro por marca */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Marca</h3>
                <div className="space-y-2">
                  {["Adidas", "Balenciaga", "K-Swiss", "Nike", "Puma"].map(
                    (brand) => (
                      <label key={brand} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          className="mr-2 h-4 w-4 rounded text-pink-600 focus:ring-pink-500"
                          checked={activeFilters.brands.includes(brand)}
                          onChange={() => handleFilterChange("brands", brand)}
                        />
                        {brand}
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Categoria */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Categoria</h3>
                <div className="space-y-2">
                  {["Esporte e lazer", "Casual", "Utilitário", "Corrida"].map(
                    (category) => (
                      <label
                        key={category}
                        className="flex items-center text-sm"
                      >
                        <input
                          type="checkbox"
                          className="mr-2 h-4 w-4 rounded text-pink-600 focus:ring-pink-500"
                          checked={activeFilters.categories.includes(category)}
                          onChange={() =>
                            handleFilterChange("categories", category)
                          }
                        />
                        {category}
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Preço */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Preço</h3>
                <div className="space-y-2">
                  {[
                    "Até R$50",
                    "R$50 a R$100",
                    "R$100 a R$200",
                    "Acima de R$200",
                  ].map((priceRange) => (
                    <label
                      key={priceRange}
                      className="flex items-center text-sm"
                    >
                      <input
                        type="radio"
                        name="price-mobile"
                        className="mr-2 h-4 w-4 text-pink-600 focus:ring-pink-500"
                        checked={activeFilters.price === priceRange}
                        onChange={() => handleFilterChange("price", priceRange)}
                      />
                      {priceRange}
                    </label>
                  ))}
                </div>
              </div>

              {/* Gênero */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Gênero</h3>
                <div className="space-y-2">
                  {["Masculino", "Feminino", "Unisex"].map((gender) => (
                    <label key={gender} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 rounded text-pink-600 focus:ring-pink-500"
                        checked={activeFilters.gender.includes(gender)}
                        onChange={() => handleFilterChange("gender", gender)}
                      />
                      {gender}
                    </label>
                  ))}
                </div>
              </div>

              {/* Estado */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Estado</h3>
                <div className="space-y-2">
                  {["Novo", "Usado"].map((condition) => (
                    <label
                      key={condition}
                      className="flex items-center text-sm"
                    >
                      <input
                        type="radio"
                        name="condition-mobile"
                        className="mr-2 h-4 w-4 text-pink-600 focus:ring-pink-500"
                        checked={activeFilters.condition === condition}
                        onChange={() =>
                          handleFilterChange("condition", condition)
                        }
                      />
                      {condition}
                    </label>
                  ))}
                </div>
              </div>

              {/* Botões de aplicar e limpar filtros */}
              <div className="mt-6 space-y-2">
                <button
                  className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition-colors"
                  onClick={toggleFilter}
                >
                  Aplicar Filtros
                </button>
                <button
                  className="w-full py-2 text-sm text-gray-700 hover:text-pink-600 transition-colors underline"
                  onClick={() => {
                    setActiveFilters({
                      colors: [],
                      brands: [],
                      categories: [],
                      price: null,
                      gender: [],
                      condition: null,
                    });
                  }}
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductList;
