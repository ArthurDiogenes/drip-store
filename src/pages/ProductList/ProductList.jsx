import React, { useState, useEffect } from "react";
import { ChevronRight, X, Filter, ChevronDown } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import Layout from "../../components/layout/Layout";
import ProductCard from "../../components/ProductCard/ProductCard";
import styles from "./ProductList.module.css";

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productCount, setProductCount] = useState(0);

  const [activeFilters, setActiveFilters] = useState({
    brands: searchParams.getAll("marca") || [],
    categories: searchParams.getAll("categoria") || [],
    price: searchParams.get("preco") || null,
    gender: searchParams.getAll("genero") || [],
    condition: searchParams.get("estado") || null,
  });

  const [sortBy, setSortBy] = useState(
    searchParams.get("ordenar") || "relevancia"
  );

  const [page, setPage] = useState(
    parseInt(searchParams.get("pagina") || "1", 10)
  );
  const [pageSize] = useState(parseInt(searchParams.get("itens") || "12", 10));

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const searchQuery = searchParams.get("q") || "";

  // Função para normalizar texto (remove acentos)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  // Função para criar variações de busca
  const createSearchVariations = (term) => {
    const normalized = normalizeText(term);
    const words = normalized.split(" ").filter((word) => word.length > 1);
    const variations = [];

    // Adiciona o termo completo
    variations.push(normalized);

    // Para cada palavra, cria variações singulares e plurais
    words.forEach((word) => {
      // Remove 's' do final para singular
      if (word.endsWith("s") && word.length > 3) {
        variations.push(word.slice(0, -1));
      }

      // Remove 'es' do final para singular
      if (word.endsWith("es") && word.length > 4) {
        variations.push(word.slice(0, -2));
      }

      // Adiciona 's' para plural
      if (!word.endsWith("s")) {
        variations.push(word + "s");
        // Adiciona 'es' para palavras que terminam em consoante
        if (!/[aeiou]$/.test(word)) {
          variations.push(word + "es");
        }
      }

      // Tratamento especial para palavras comuns
      const specialCases = {
        tenis: ["tenis", "tennis"],
        tennis: ["tenis", "tennis"],
        bone: ["bone", "bones", "boné", "bonés"],
        bones: ["bone", "bones", "boné", "bonés"],
        calca: ["calca", "calcas", "calça", "calças"],
        calcas: ["calca", "calcas", "calça", "calças"],
        camisa: ["camisa", "camisas", "camiseta", "camisetas"],
        camiseta: ["camisa", "camisas", "camiseta", "camisetas"],
        camisetas: ["camisa", "camisas", "camiseta", "camisetas"],
        headphone: ["headphone", "headphones", "fone", "fones"],
        headphones: ["headphone", "headphones", "fone", "fones"],
      };

      if (specialCases[word]) {
        variations.push(...specialCases[word]);
      }
    });

    // Remove duplicatas e retorna
    return [...new Set(variations)];
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categorias")
          .select("id, nome, slug")
          .eq("ativo", true)
          .order("nome", { ascending: true });

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        const { data: brandsData, error: brandsError } = await supabase
          .from("marcas")
          .select("id, nome, slug")
          .eq("ativo", true)
          .order("nome", { ascending: true });

        if (brandsError) throw brandsError;
        setBrands(brandsData || []);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        setError(
          "Não foi possível carregar os filtros. Por favor, tente novamente mais tarde."
        );
      }
    };

    loadInitialData();
  }, []);

  // Força recarregar quando o termo de busca mudar
  useEffect(() => {
    // Reseta a página para 1 quando o termo de busca mudar
    if (searchQuery !== searchParams.get("q")) {
      setPage(1);
    }
  }, [searchParams.get("q")]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        let categoryIds = [];
        let brandIds = [];

        if (activeFilters.categories.length > 0) {
          const { data: categoryData } = await supabase
            .from("categorias")
            .select("id")
            .in("slug", activeFilters.categories);

          if (categoryData) {
            categoryIds = categoryData.map((cat) => cat.id);
          }
        }

        if (activeFilters.brands.length > 0) {
          const { data: brandData } = await supabase
            .from("marcas")
            .select("id")
            .in("slug", activeFilters.brands);

          if (brandData) {
            brandIds = brandData.map((brand) => brand.id);
          }
        }

        let query = supabase
          .from("produtos")
          .select(
            `
            id, 
            nome, 
            slug, 
            preco_original, 
            preco_promocional,
            desconto_porcentagem,
            categoria_id (id, nome, slug),
            marca_id (id, nome, slug),
            genero,
            estado,
            descricao,
            imagens_produto (id, url, principal, ordem)
          `,
            { count: "exact" }
          )
          .eq("ativo", true);

        if (brandIds.length > 0) {
          query = query.in("marca_id", brandIds);
        }

        if (categoryIds.length > 0) {
          query = query.in("categoria_id", categoryIds);
        }

        if (activeFilters.gender.length > 0) {
          query = query.in("genero", activeFilters.gender);
        }

        if (activeFilters.condition) {
          query = query.eq("estado", activeFilters.condition);
        }

        if (activeFilters.price) {
          switch (activeFilters.price) {
            case "Até R$50":
              query = query.lt("preco_promocional", 50);
              break;
            case "R$50 a R$100":
              query = query
                .gte("preco_promocional", 50)
                .lte("preco_promocional", 100);
              break;
            case "R$100 a R$200":
              query = query
                .gte("preco_promocional", 100)
                .lte("preco_promocional", 200);
              break;
            case "Acima de R$200":
              query = query.gt("preco_promocional", 200);
              break;
            default:
              break;
          }
        }

        // Busca inteligente com variações
        if (searchQuery) {
          // Cria variações de busca
          const searchVariations = createSearchVariations(searchQuery);

          // Constrói uma query OR complexa para buscar todas as variações
          let searchConditions = [];
          searchVariations.forEach((variation) => {
            searchConditions.push(`nome.ilike.%${variation}%`);
            searchConditions.push(`descricao.ilike.%${variation}%`);
          });

          // Também busca nas categorias
          const matchingCategories = categories.filter((category) => {
            const normalizedCategoryName = normalizeText(category.nome);
            return searchVariations.some(
              (variation) =>
                normalizedCategoryName.includes(variation) ||
                variation.includes(normalizedCategoryName)
            );
          });

          if (matchingCategories.length > 0) {
            const categoryIds = matchingCategories.map((cat) => cat.id);
            searchConditions.push(`categoria_id.in.(${categoryIds.join(",")})`);
          }

          // Aplica todas as condições OR
          if (searchConditions.length > 0) {
            query = query.or(searchConditions.join(","));
          }
        }

        if (sortBy) {
          switch (sortBy) {
            case "menor_preco":
              query = query.order("preco_promocional", { ascending: true });
              break;
            case "maior_preco":
              query = query.order("preco_promocional", { ascending: false });
              break;
            case "mais_recente":
              query = query.order("data_criacao", { ascending: false });
              break;
            case "mais_vendido":
              query = query.order("quantidade_vendas", { ascending: false });
              break;
            default:
              query = query
                .order("destacado", { ascending: false })
                .order("quantidade_vendas", { ascending: false });
              break;
          }
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await query.range(from, to);

        if (error) throw error;

        // Se temos um termo de busca, fazemos uma ordenação adicional por relevância
        let processedData = data || [];
        if (searchQuery && processedData.length > 0) {
          const normalizedQuery = normalizeText(searchQuery);

          processedData = processedData.sort((a, b) => {
            const aNormalized = normalizeText(a.nome);
            const bNormalized = normalizeText(b.nome);
            const aDescNormalized = normalizeText(a.descricao || "");
            const bDescNormalized = normalizeText(b.descricao || "");

            // Produtos que contêm o termo exato no nome primeiro
            const aHasExactInName = aNormalized.includes(normalizedQuery);
            const bHasExactInName = bNormalized.includes(normalizedQuery);

            if (aHasExactInName && !bHasExactInName) return -1;
            if (!aHasExactInName && bHasExactInName) return 1;

            // Produtos que começam com o termo
            const aStartsWith = aNormalized.startsWith(normalizedQuery);
            const bStartsWith = bNormalized.startsWith(normalizedQuery);

            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;

            // Por último, produtos que têm o termo na descrição
            const aHasInDesc = aDescNormalized.includes(normalizedQuery);
            const bHasInDesc = bDescNormalized.includes(normalizedQuery);

            if (aHasInDesc && !bHasInDesc) return -1;
            if (!aHasInDesc && bHasInDesc) return 1;

            return 0;
          });
        }

        const formattedData = processedData.map((product) => {
          const imagens = product.imagens_produto || [];
          const imagemPrincipal =
            imagens.find((img) => img.principal) || imagens[0];

          return {
            id: product.id,
            nome: product.nome,
            slug: product.slug,
            precoOriginal: product.preco_original,
            precoAtual: product.preco_promocional || product.preco_original,
            desconto: product.desconto_porcentagem,
            categoria: product.categoria_id?.nome || "",
            marca: product.marca_id?.nome || "",
            imagemUrl:
              imagemPrincipal?.url || "../images/products/produc-image-0.png",
          };
        });

        setProducts(formattedData);
        setProductCount(count || 0);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
        setError(
          "Não foi possível carregar os produtos. Tente novamente mais tarde."
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

    const newParams = new URLSearchParams();

    activeFilters.brands.forEach((brand) => newParams.append("marca", brand));
    activeFilters.categories.forEach((category) =>
      newParams.append("categoria", category)
    );
    activeFilters.gender.forEach((gender) =>
      newParams.append("genero", gender)
    );

    if (activeFilters.price) newParams.set("preco", activeFilters.price);
    if (activeFilters.condition)
      newParams.set("estado", activeFilters.condition);
    if (sortBy) newParams.set("ordenar", sortBy);
    if (page > 1) newParams.set("pagina", page.toString());
    if (searchQuery) newParams.set("q", searchQuery);

    setSearchParams(newParams);
  }, [
    activeFilters,
    sortBy,
    page,
    pageSize,
    searchQuery,
    setSearchParams,
    categories,
  ]);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterChange = (category, value) => {
    setActiveFilters((prev) => {
      const updated = { ...prev };

      if (Array.isArray(updated[category])) {
        if (updated[category].includes(value)) {
          updated[category] = updated[category].filter(
            (item) => item !== value
          );
        } else {
          updated[category] = [...updated[category], value];
        }
      } else {
        updated[category] = updated[category] === value ? null : value;
      }

      return updated;
    });

    setPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const clearAllFilters = () => {
    setActiveFilters({
      brands: [],
      categories: [],
      price: null,
      gender: [],
      condition: null,
    });
    setPage(1);

    navigate("/produtos");
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  // Função para mostrar quando é uma busca
  const getPageTitle = () => {
    if (searchQuery) {
      return `Resultados para "${searchQuery}"`;
    }

    if (activeFilters.categories.length === 1) {
      const categoryName = categories.find(
        (cat) => cat.slug === activeFilters.categories[0]
      )?.nome;
      return categoryName || "Produtos";
    }

    if (activeFilters.brands.length === 1) {
      const brandName = brands.find(
        (brand) => brand.slug === activeFilters.brands[0]
      )?.nome;
      return brandName ? `Produtos ${brandName}` : "Produtos";
    }

    return "Produtos";
  };

  return (
    <Layout>
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-pink-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-900 font-medium">Produtos</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-xl font-medium">{getPageTitle()}</h1>
              <span className="text-sm text-gray-500">
                {productCount} {productCount === 1 ? "produto" : "produtos"}
              </span>
            </div>

            <div className="flex items-center w-full md:w-auto justify-between">
              <div className="relative flex items-center">
                <label htmlFor="sort" className="text-sm text-gray-500 mr-2">
                  Ordenar por:
                </label>
                <div className="relative">
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={handleSortChange}
                    className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="relevancia">Relevância</option>
                    <option value="menor_preco">Menor preço</option>
                    <option value="maior_preco">Maior preço</option>
                    <option value="mais_recente">Mais recente</option>
                    <option value="mais_vendido">Mais vendido</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              <button
                onClick={toggleFilter}
                className="md:hidden bg-pink-600 text-white p-2 rounded-md hover:bg-pink-700 transition-colors"
                aria-label="Filtrar"
              >
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-white rounded-md shadow-sm p-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-medium mb-4 pb-3 border-b border-gray-200 w-full">
                    Filtrar por
                  </h2>
                  {activeFilters.brands.length > 0 ||
                  activeFilters.categories.length > 0 ||
                  activeFilters.price ||
                  activeFilters.gender.length > 0 ||
                  activeFilters.condition ? (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-pink-600 hover:text-pink-800 transition-colors ml-2"
                    >
                      Limpar
                    </button>
                  ) : null}
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Marca</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {brands.map((brand) => (
                      <label
                        key={brand.id}
                        className={`${styles.checkboxLabel} text-sm`}
                      >
                        <input
                          type="checkbox"
                          className={styles.customCheckbox}
                          checked={activeFilters.brands.includes(brand.slug)}
                          onChange={() =>
                            handleFilterChange("brands", brand.slug)
                          }
                        />
                        {brand.nome}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Categoria</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className={`${styles.checkboxLabel} text-sm`}
                      >
                        <input
                          type="checkbox"
                          className={styles.customCheckbox}
                          checked={activeFilters.categories.includes(
                            category.slug
                          )}
                          onChange={() =>
                            handleFilterChange("categories", category.slug)
                          }
                        />
                        {category.nome}
                      </label>
                    ))}
                  </div>
                </div>

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
                        className={`${styles.checkboxLabel} text-sm`}
                      >
                        <input
                          type="radio"
                          name="price"
                          className={styles.customRadio}
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

                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Gênero</h3>
                  <div className="space-y-2">
                    {["Masculino", "Feminino", "Unisex"].map((gender) => (
                      <label
                        key={gender}
                        className={`${styles.checkboxLabel} text-sm`}
                      >
                        <input
                          type="checkbox"
                          className={styles.customCheckbox}
                          checked={activeFilters.gender.includes(gender)}
                          onChange={() => handleFilterChange("gender", gender)}
                        />
                        {gender}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Estado</h3>
                  <div className="space-y-2">
                    {["Novo", "Usado"].map((condition) => (
                      <label
                        key={condition}
                        className={`${styles.checkboxLabel} text-sm`}
                      >
                        <input
                          type="radio"
                          name="condition"
                          className={styles.customRadio}
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

            <div className="flex-grow">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[...Array(pageSize)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-md shadow-sm p-4 h-64"
                    ></div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-white rounded-md p-8 text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-md p-8 text-center">
                  <p className="text-gray-500 mb-4">
                    Nenhum produto encontrado com os filtros selecionados.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <div>
                  <ProductCard produtos={products} />

                  {productCount > pageSize && (
                    <div className="mt-8 flex justify-center">
                      <div className="flex space-x-2">
                        {page > 1 && (
                          <button
                            onClick={() => handlePageChange(page - 1)}
                            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                          >
                            Anterior
                          </button>
                        )}

                        {[...Array(Math.ceil(productCount / pageSize))]
                          .slice(
                            Math.max(0, page - 3),
                            Math.min(
                              Math.ceil(productCount / pageSize),
                              page + 2
                            )
                          )
                          .map((_, i) => {
                            const pageNumber = Math.max(1, page - 2) + i;
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`px-4 py-2 border rounded-md ${
                                  pageNumber === page
                                    ? "bg-pink-600 text-white border-pink-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          })}

                        {page < Math.ceil(productCount / pageSize) && (
                          <button
                            onClick={() => handlePageChange(page + 1)}
                            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                          >
                            Próxima
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={toggleFilter}
          ></div>
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-white overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-medium">Filtrar por</h2>
                <button onClick={toggleFilter} className="text-gray-500">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Marca</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {brands.map((brand) => (
                    <label
                      key={brand.id}
                      className={`${styles.checkboxLabel} text-sm`}
                    >
                      <input
                        type="checkbox"
                        className={styles.customCheckbox}
                        checked={activeFilters.brands.includes(brand.slug)}
                        onChange={() =>
                          handleFilterChange("brands", brand.slug)
                        }
                      />
                      {brand.nome}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Categoria</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className={`${styles.checkboxLabel} text-sm`}
                    >
                      <input
                        type="checkbox"
                        className={styles.customCheckbox}
                        checked={activeFilters.categories.includes(
                          category.slug
                        )}
                        onChange={() =>
                          handleFilterChange("categories", category.slug)
                        }
                      />
                      {category.nome}
                    </label>
                  ))}
                </div>
              </div>

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
                      className={`${styles.checkboxLabel} text-sm`}
                    >
                      <input
                        type="radio"
                        name="price-mobile"
                        className={styles.customRadio}
                        checked={activeFilters.price === priceRange}
                        onChange={() => handleFilterChange("price", priceRange)}
                      />
                      {priceRange}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Gênero</h3>
                <div className="space-y-2">
                  {["Masculino", "Feminino", "Unisex"].map((gender) => (
                    <label
                      key={gender}
                      className={`${styles.checkboxLabel} text-sm`}
                    >
                      <input
                        type="checkbox"
                        className={styles.customCheckbox}
                        checked={activeFilters.gender.includes(gender)}
                        onChange={() => handleFilterChange("gender", gender)}
                      />
                      {gender}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Estado</h3>
                <div className="space-y-2">
                  {["Novo", "Usado"].map((condition) => (
                    <label
                      key={condition}
                      className={`${styles.checkboxLabel} text-sm`}
                    >
                      <input
                        type="radio"
                        name="condition-mobile"
                        className={styles.customRadio}
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

              <div className="mt-6">
                <button
                  className="w-full py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700 transition-colors"
                  onClick={() => {
                    clearAllFilters();
                    toggleFilter();
                  }}
                >
                  Aplicar Filtros
                </button>

                {(activeFilters.brands.length > 0 ||
                  activeFilters.categories.length > 0 ||
                  activeFilters.price ||
                  activeFilters.gender.length > 0 ||
                  activeFilters.condition) && (
                  <button
                    className="w-full mt-3 py-2 text-sm text-gray-700 hover:text-pink-600 transition-colors underline"
                    onClick={() => {
                      clearAllFilters();
                      toggleFilter();
                    }}
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductList;
