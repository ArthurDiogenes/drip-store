import { supabase } from "./supabase";

export const searchProducts = async (searchTerm, filters = {}) => {
  try {
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
        imagens_produto (id, url, principal, ordem)
      `
      )
      .eq("ativo", true);

    if (searchTerm) {
      query = query.or(
        `nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`
      );
    }

    if (filters.categoria) {
      query = query.eq("categoria_id", filters.categoria);
    }

    if (filters.marca) {
      query = query.eq("marca_id", filters.marca);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro na busca:", error);
    throw error;
  }
};
