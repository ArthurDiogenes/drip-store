import { supabase } from './supabase';

const getSizesForCategory = (categoryName) => {
  const category = categoryName?.toLowerCase();
  
  if (category?.includes('tênis') || category?.includes('tenis') || category?.includes('sapato')) {
    return ['39', '40', '41', '42', '43', '44', '45'];
  } else if (category?.includes('camiseta') || category?.includes('camisa') || 
             category?.includes('calça') || category?.includes('calca') || 
             category?.includes('bermuda') || category?.includes('short') ||
             category?.includes('blusa') || category?.includes('casaco')) {
    return ['P', 'M', 'G', 'GG'];
  } else if (category?.includes('boné') || category?.includes('bone') || 
             category?.includes('chapéu') || category?.includes('chapeu') ||
             category?.includes('headphone') || category?.includes('fone')) {
    return ['P', 'M', 'G', 'GG'];
  }
  
  return ['P', 'M', 'G', 'GG'];
};

const getColorsForProduct = () => {
  return [
    '#000000',
    '#A0A0A0', 
    '#FFFFFF', 
    '#FF0000', 
    '#0000FF' 
  ];
};

export const getHeroBannerProducts = async (limit = 8) => {
  try {
    console.log('Buscando produtos para hero banner...');
    
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        id, 
        nome, 
        slug, 
        preco_original, 
        preco_promocional,
        desconto_porcentagem,
        categoria_id (nome),
        marca_id (nome),
        imagens_produto (url, principal, ordem)
      `)
      .eq('destacado', true)
      .eq('ativo', true)
      .order('quantidade_vendas', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar produtos para banner:', error);
      return [];
    }
    
    console.log('Produtos encontrados para banner:', data.length);
    
    return data.map((product) => {
      const imagens = product.imagens_produto || [];
      const imagemPrincipal = imagens.find(img => img.principal) || imagens[0];
      
      const brandName = product.marca_id?.nome || '';
      const categoryName = product.categoria_id?.nome || '';
      
      let bannerTitle = product.nome;
      if (brandName) {
        bannerTitle = `${brandName} ${categoryName}`;
      }
      
      let bannerDescription = '';
      if (categoryName?.toLowerCase().includes('tênis')) {
        bannerDescription = 'Conforto e estilo para seus pés. Tecnologia de ponta e design moderno em cada passo.';
      } else if (categoryName?.toLowerCase().includes('camiseta')) {
        bannerDescription = 'Vista-se com atitude! Camisetas premium com qualidade superior e estilo único.';
      } else if (categoryName?.toLowerCase().includes('headphone')) {
        bannerDescription = 'Som de alta qualidade e design premium. Sua experiência musical nunca mais será a mesma.';
      } else {
        bannerDescription = `Produtos de alta qualidade em ${categoryName}. Descontos especiais por tempo limitado!`;
      }
      
      let buttonText = 'Ver Produto';
      if (product.desconto_porcentagem > 0) {
        if (product.desconto_porcentagem >= 50) {
          buttonText = 'SUPER OFERTA!';
        } else if (product.desconto_porcentagem >= 30) {
          buttonText = `${product.desconto_porcentagem}% OFF`;
        } else {
          buttonText = 'Aproveitar';
        }
      }
      
      return {
        id: product.id,
        title: bannerTitle,
        description: bannerDescription,
        imageUrl: imagemPrincipal?.url || '../images/home-slides/White-Sneakers-PNG-Clipart 1.png',
        buttonText: buttonText,
        buttonLink: `/produto/${product.slug}`,
        discount: product.desconto_porcentagem || 0
      };
    });
  } catch (error) {
    console.error('Erro ao buscar produtos para hero banner:', error);
    return [];
  }
};

export const getFeaturedProducts = async (limit = 8) => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        id, 
        nome, 
        slug, 
        preco_original, 
        preco_promocional,
        desconto_porcentagem,
        em_promocao,
        categoria_id (id, nome, slug),
        marca_id (id, nome, slug),
        imagens_produto (id, url, principal, ordem)
      `)
      .eq('destacado', true)
      .eq('ativo', true)
      .order('quantidade_vendas', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    return data.map(product => {
      const imagens = product.imagens_produto || [];
      const imagemPrincipal = imagens.find(img => img.principal) || imagens[0];
      
      return {
        id: product.id,
        nome: product.nome,
        slug: product.slug,
        precoOriginal: product.preco_original,
        precoAtual: product.preco_promocional || product.preco_original,
        desconto: product.desconto_porcentagem,
        categoria: product.categoria_id?.nome || '',
        marca: product.marca_id?.nome || '',
        imagemUrl: imagemPrincipal?.url || '../images/products/produc-image-0.png'
      };
    });
  } catch (error) {
    console.error('Erro ao buscar produtos em alta:', error);
    return [];
  }
};

export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nome, slug, imagem_url')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
};

export const getCollections = async () => {
  try {
    const { data, error } = await supabase
      .from('colecoes')
      .select('id, nome, slug, descricao, imagem_url')
      .eq('destaque', true)
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar coleções:', error);
    return [];
  }
};

export const getProductsByCategory = async (categorySlug) => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        id, 
        nome, 
        slug, 
        preco_original, 
        preco_promocional,
        desconto_porcentagem,
        em_promocao,
        categoria_id (id, nome, slug),
        imagens_produto (url)
      `)
      .eq('categoria_id.slug', categorySlug)
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) throw error;
    
    return data.map(product => ({
      id: product.id,
      nome: product.nome,
      slug: product.slug,
      precoOriginal: product.preco_original,
      precoAtual: product.preco_promocional || product.preco_original,
      desconto: product.desconto_porcentagem,
      categoria: product.categoria_id?.nome,
      imagemUrl: product.imagens_produto[0]?.url || '../images/products/produc-image-0.png'
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    return [];
  }
};

export const getProductBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        id,
        nome,
        slug,
        descricao,
        tipo,
        genero,
        ref,
        preco_original,
        preco_promocional,
        desconto_porcentagem,
        avaliacao_media,
        quantidade_avaliacoes,
        categoria_id (id, nome, slug),
        marca_id (id, nome, slug),
        imagens_produto (id, url, principal, ordem),
        variacoes_produto (
          id,
          cor_id (id, nome, codigo_hex),
          tamanho_id (id, valor),
          quantidade_estoque
        )
      `)
      .eq('slug', slug)
      .eq('ativo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Product not found');
      }
      throw error;
    }
    
    let availableColors = [];
    let availableSizes = [];
    
    if (data.variacoes_produto && data.variacoes_produto.length > 0) {
      data.variacoes_produto.forEach(variation => {
        if (variation.cor_id && !availableColors.some(c => c.id === variation.cor_id.id)) {
          availableColors.push({
            id: variation.cor_id.id,
            name: variation.cor_id.nome,
            hexCode: variation.cor_id.codigo_hex
          });
        }
        
        if (variation.tamanho_id && !availableSizes.some(s => s.id === variation.tamanho_id.id)) {
          availableSizes.push({
            id: variation.tamanho_id.id,
            value: variation.tamanho_id.valor
          });
        }
      });
    }
    
    if (availableSizes.length === 0) {
      const defaultSizes = getSizesForCategory(data.categoria_id?.nome);
      availableSizes = defaultSizes.map((size, index) => ({
        id: `default-${index}`,
        value: size
      }));
    }
    
    if (availableColors.length === 0) {
      const defaultColors = getColorsForProduct();
      availableColors = defaultColors.map((color, index) => ({
        id: `default-${index}`,
        name: `Cor ${index + 1}`,
        hexCode: color
      }));
    }
    
    const sortedImages = [...(data.imagens_produto || [])];
    sortedImages.sort((a, b) => {
      if (a.principal) return -1;
      if (b.principal) return 1;
      return (a.ordem || 0) - (b.ordem || 0);
    });
    
    const finalImages = sortedImages.length > 0 
      ? sortedImages.map(img => ({
          id: img.id,
          src: img.url,
          alt: `${data.nome} - imagem ${img.ordem || 0}`
        }))
      : [{
          id: 'default',
          src: '../images/products/produc-image-0.png',
          alt: `${data.nome} - imagem padrão`
        }];
    
    return {
      id: data.id,
      name: data.nome,
      description: data.descricao || 'Descrição não disponível para este produto.',
      category: data.categoria_id?.nome,
      brand: data.marca_id?.nome,
      ref: data.ref,
      rating: data.avaliacao_media,
      reviewCount: data.quantidade_avaliacoes,
      originalPrice: data.preco_original,
      currentPrice: data.preco_promocional || data.preco_original,
      colors: availableColors.map(c => c.hexCode),
      sizes: availableSizes.map(s => s.value),
      images: finalImages,
      variations: data.variacoes_produto || []
    };
  } catch (error) {
    console.error('Erro ao buscar produto por slug:', error);
    throw error;
  }
};

export const getRelatedProducts = async (productId, limit = 4) => {
  try {
    const { data: relatedData, error: relatedError } = await supabase
      .from('produtos_relacionados')
      .select(`
        produto_relacionado_id (
          id,
          nome,
          slug,
          preco_original,
          preco_promocional,
          desconto_porcentagem,
          categoria_id (nome),
          imagens_produto (url)
        )
      `)
      .eq('produto_id', productId)
      .eq('ativo', true)
      .limit(limit);

    if (relatedError) throw relatedError;
    
    if (relatedData && relatedData.length > 0) {
      return relatedData.map(item => {
        const product = item.produto_relacionado_id;
        return {
          id: product.id,
          nome: product.nome,
          slug: product.slug,
          precoOriginal: product.preco_original,
          precoAtual: product.preco_promocional || product.preco_original,
          desconto: product.desconto_porcentagem,
          categoria: product.categoria_id?.nome,
          imagemUrl: product.imagens_produto[0]?.url || '../images/products/produc-image-0.png'
        };
      });
    }
    
    const { data: product } = await supabase
      .from('produtos')
      .select('categoria_id')
      .eq('id', productId)
      .single();
      
    if (!product) return [];
    
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        id,
        nome,
        slug,
        preco_original,
        preco_promocional,
        desconto_porcentagem,
        categoria_id (nome),
        imagens_produto (url)
      `)
      .eq('categoria_id', product.categoria_id)
      .neq('id', productId) 
      .eq('ativo', true)
      .order('quantidade_vendas', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data.map(product => ({
      id: product.id,
      nome: product.nome,
      slug: product.slug,
      precoOriginal: product.preco_original,
      precoAtual: product.preco_promocional || product.preco_original,
      desconto: product.desconto_porcentagem,
      categoria: product.categoria_id?.nome,
      imagemUrl: product.imagens_produto[0]?.url || '../images/products/produc-image-0.png'
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos relacionados:', error);
    return [];
  }
};