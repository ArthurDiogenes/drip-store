import React, { useState, useEffect } from "react";
import { ChevronRight, X, Filter, ChevronDown } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../services/supabase";
import Layout from "../../components/layout/Layout";
import ProductCard from "../../components/ProductCard/ProductCard";
import styles from "./ProductList.module.css";

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productCount, setProductCount] = useState(0);

  const [activeFilters, setActiveFilters] = useState({
    brands: [],
    categories: [],
    price: null,
    gender: [],
    condition: null,
  });
  const [sortBy, setSortBy] = useState("relevancia");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const searchQuery = searchParams.get("q") || "";

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const createSearchVariations = (term) => {
    const normalized = normalizeText(term);
    const words = normalized.split(" ").filter((word) => word.length > 1);
    const variations = [normalized];
    words.forEach((word) => {
      if (word.endsWith("s") && word.length > 3)
        variations.push(word.slice(0, -1));
      if (word.endsWith("es") && word.length > 4)
        variations.push(word.slice(0, -2));
      if (!word.endsWith("s")) {
        variations.push(word + "s");
        if (!/[aeiou]$/.test(word)) variations.push(word + "es");
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
        camisetas: ["camisa", "camisas", "camiseta", "camisetas"],
        headphone: ["headphone", "headphones", "fone", "fones"],
        headphones: ["headphone", "headphones", "fone", "fones"],
      };
      if (specialCases[word]) variations.push(...specialCases[word]);
    });
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
      } catch (fetchError) {
        console.error("Erro ao carregar dados iniciais:", fetchError);
        setError(
          "Não foi possível carregar os filtros. Por favor, tente novamente mais tarde."
        );
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    setLoading(true);
    setProducts([]);
    setActiveFilters({
      brands: searchParams.getAll("marca") || [],
      categories: searchParams.getAll("categoria") || [],
      price: searchParams.get("preco") || null,
      gender: searchParams.getAll("genero") || [],
      condition: searchParams.get("estado") || null,
    });
    setSortBy(searchParams.get("ordenar") || "relevancia");
    setPage(parseInt(searchParams.get("pagina") || "1", 10));
    window.scrollTo(0, 0);
  }, [searchParams]);

  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const currentCategorySlugs = activeFilters.categories;
        const currentBrandSlugs = activeFilters.brands;

        let categoryIds = [];
        if (currentCategorySlugs.length > 0) {
          if (categories.length === 0) {
            setLoading(true);
            return;
          }
          categoryIds = categories
            .filter((cat) => currentCategorySlugs.includes(cat.slug))
            .map((cat) => cat.id);
        }

        let brandIds = [];
        if (currentBrandSlugs.length > 0) {
          if (brands.length === 0) {
            setLoading(true);
            return;
          }
          brandIds = brands
            .filter((brand) => currentBrandSlugs.includes(brand.slug))
            .map((brand) => brand.id);
        }

        let query = supabase
          .from("produtos")
          .select(
            `id, nome, slug, preco_original, preco_promocional,
            desconto_porcentagem, categoria_id (id, nome, slug),
            marca_id (id, nome, slug), genero, estado, descricao,
            imagens_produto (id, url, principal, ordem)`,
            { count: "exact" }
          )
          .eq("ativo", true);

        if (currentBrandSlugs.length > 0) {
          query = query.in(
            "marca_id",
            brandIds.length > 0 ? brandIds : ["dummy-nonexistent-id"]
          );
        }
        if (currentCategorySlugs.length > 0) {
          query = query.in(
            "categoria_id",
            categoryIds.length > 0 ? categoryIds : ["dummy-nonexistent-id"]
          );
        }

        if (activeFilters.gender.length > 0)
          query = query.in("genero", activeFilters.gender);
        if (activeFilters.condition)
          query = query.eq("estado", activeFilters.condition);

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

        if (searchQuery) {
          const searchVariations = createSearchVariations(searchQuery);
          let searchConditions = [];
          searchVariations.forEach((variation) => {
            searchConditions.push(`nome.ilike.%${variation}%`);
            searchConditions.push(`descricao.ilike.%${variation}%`);
          });
          if (categories.length > 0) {
            const matchingCategories = categories.filter((cat) => {
              const normalizedCategoryName = normalizeText(cat.nome);
              return searchVariations.some(
                (v) =>
                  normalizedCategoryName.includes(v) ||
                  v.includes(normalizedCategoryName)
              );
            });
            if (matchingCategories.length > 0) {
              searchConditions.push(
                `categoria_id.in.(${matchingCategories
                  .map((c) => c.id)
                  .join(",")})`
              );
            }
          }
          if (searchConditions.length > 0)
            query = query.or(searchConditions.join(","));
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
        const { data, error: queryError, count } = await query.range(from, to);

        if (queryError) throw queryError;

        let processedData = data || [];
        if (searchQuery && processedData.length > 0) {
          const normalizedQuery = normalizeText(searchQuery);
          processedData = processedData.sort((a, b) => {
            const aNormalized = normalizeText(a.nome);
            const bNormalized = normalizeText(b.nome);
            const aDescNormalized = normalizeText(a.descricao || "");
            const bDescNormalized = normalizeText(b.descricao || "");
            const aHasExactInName = aNormalized.includes(normalizedQuery);
            const bHasExactInName = bNormalized.includes(normalizedQuery);
            if (aHasExactInName && !bHasExactInName) return -1;
            if (!aHasExactInName && bHasExactInName) return 1;
            const aStartsWith = aNormalized.startsWith(normalizedQuery);
            const bStartsWith = bNormalized.startsWith(normalizedQuery);
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
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
        setProductCount(0);
      } finally {
        setLoading(false);
      }
    };

    const categorySlugsPresent = activeFilters.categories.length > 0;
    const brandSlugsPresent = activeFilters.brands.length > 0;
    const masterCategoriesReady = categories.length > 0;
    const masterBrandsReady = brands.length > 0;

    let effectivelyLoadingMasterData = false;
    if (categorySlugsPresent && !masterCategoriesReady)
      effectivelyLoadingMasterData = true;
    if (brandSlugsPresent && !masterBrandsReady)
      effectivelyLoadingMasterData = true;

    if (effectivelyLoadingMasterData) {
      if (!loading) setLoading(true);
      return;
    }

    fetchProductsData();
  }, [activeFilters, sortBy, page, pageSize, searchQuery, categories, brands]);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterChange = (category, value) => {
    const newParams = new URLSearchParams(searchParams);
    const paramKeyMap = {
      brands: "marca",
      categories: "categoria",
      gender: "genero",
      price: "preco",
      condition: "estado",
    };
    const actualParamKey = paramKeyMap[category] || category;

    if (Array.isArray(activeFilters[category])) {
      const currentValues = newParams.getAll(actualParamKey);
      if (currentValues.includes(value)) {
        newParams.delete(actualParamKey);
        currentValues
          .filter((item) => item !== value)
          .forEach((item) => newParams.append(actualParamKey, item));
      } else {
        newParams.append(actualParamKey, value);
      }
    } else {
      if (newParams.get(actualParamKey) === value) {
        newParams.delete(actualParamKey);
      } else {
        newParams.set(actualParamKey, value);
      }
    }
    newParams.delete("pagina");
    setSearchParams(newParams);
  };

  const handleSortChange = (event) => {
    const newSortBy = event.target.value;
    const newParams = new URLSearchParams(searchParams);
    newParams.set("ordenar", newSortBy);
    newParams.delete("pagina");
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    if (searchQuery) {
      newParams.set("q", searchQuery);
    }
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("pagina", newPage.toString());
    setSearchParams(newParams);
    window.scrollTo(0, 0);
  };

  const getPageTitle = () => {
    if (searchQuery) {
      return `Resultados para "${searchQuery}"`;
    }
    const categorySlugs = searchParams.getAll("categoria");
    if (categorySlugs.length === 1 && categories.length > 0) {
      const categoryName = categories.find(
        (cat) => cat.slug === categorySlugs[0]
      )?.nome;
      return categoryName || "Produtos";
    }
    const brandSlugs = searchParams.getAll("marca");
    if (brandSlugs.length === 1 && brands.length > 0) {
      const brandName = brands.find(
        (brand) => brand.slug === brandSlugs[0]
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
                {loading
                  ? "Carregando..."
                  : `${productCount} ${
                      productCount === 1 ? "produto" : "produtos"
                    }`}
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
                  {(searchParams.has("marca") ||
                    searchParams.has("categoria") ||
                    searchParams.has("preco") ||
                    searchParams.has("genero") ||
                    searchParams.has("estado")) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-pink-600 hover:text-pink-800 transition-colors ml-2"
                    >
                      Limpar
                    </button>
                  )}
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
                    toggleFilter();
                  }}
                >
                  Aplicar Filtros
                </button>
                {(searchParams.has("marca") ||
                  searchParams.has("categoria") ||
                  searchParams.has("preco") ||
                  searchParams.has("genero") ||
                  searchParams.has("estado")) && (
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
