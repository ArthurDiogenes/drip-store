import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const SearchSuggestions = ({ searchTerm, onClose }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('produtos')
          .select('id, nome, slug, preco_promocional, preco_original')
          .ilike('nome', `%${searchTerm}%`)
          .eq('ativo', true)
          .limit(5);

        if (error) throw error;
        setSuggestions(data || []);
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  if (!searchTerm || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-md z-50 max-h-96 overflow-y-auto">
      {loading ? (
        <div className="p-4 text-center text-gray-500">Buscando...</div>
      ) : (
        <>
          {suggestions.map((product) => (
            <Link
              key={product.id}
              to={`/produto/${product.slug}`}
              onClick={onClose}
              className="block p-3 hover:bg-gray-50 border-b border-gray-100"
            >
              <div className="font-medium text-gray-800">{product.nome}</div>
              <div className="text-sm text-pink-600">
                R$ {(product.preco_promocional || product.preco_original).toFixed(2).replace('.', ',')}
              </div>
            </Link>
          ))}
          <Link
            to={`/produtos?q=${encodeURIComponent(searchTerm)}`}
            onClick={onClose}
            className="block p-3 text-center text-pink-600 hover:bg-pink-50 font-medium"
          >
            Ver todos os resultados →
          </Link>
        </>
      )}
    </div>
  );
};

export default SearchSuggestions;