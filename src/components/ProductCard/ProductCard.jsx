import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ produtos }) => {
  if (!produtos || produtos.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="p-4 rounded shadow-sm hover:shadow-md transition-shadow bg-white animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {produtos.map((produto) => {
        const desconto = produto.desconto || 
          (produto.precoOriginal && produto.precoAtual && produto.precoOriginal > produto.precoAtual 
            ? Math.round(((produto.precoOriginal - produto.precoAtual) / produto.precoOriginal) * 100)
            : 0);

        return (
          <div key={produto.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
              {desconto > 0 && (
                <span className="absolute top-3 left-3 bg-lime-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
                  {desconto}% OFF
                </span>
              )}
              
              {produto.novo && (
                <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
                  Novo
                </span>
              )}
              
              <Link
                to={`/produto/${produto.slug || produto.id}`}
                className="block w-full h-full"
              >
                <img
                  src={produto.imagemUrl || produto.url}
                  alt={produto.nome}
                  className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://mjirmlyyndjerolekeje.supabase.co/storage/v1/object/public/produtos/placeholder.png';
                  }}
                />
              </Link>
            </div>
            
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                {produto.categoria}
              </p>
              
              <Link 
                to={`/produto/${produto.slug || produto.id}`} 
                className="hover:text-pink-600 transition-colors"
              >
                <h3 className="text-sm text-gray-800 font-medium mb-3 line-clamp-2 min-h-[2.5rem]">
                  {produto.nome}
                </h3>
              </Link>
              
              <div className="flex items-center gap-2">
                {produto.precoOriginal && produto.precoAtual && produto.precoOriginal > produto.precoAtual && (
                  <span className="text-xs text-gray-400 line-through">
                    R$ {produto.precoOriginal.toFixed(2).replace('.', ',')}
                  </span>
                )}
                
                <span className="text-base font-bold text-gray-900">
                  R$ {(produto.precoAtual || produto.preco_promocional || produto.preco_original || 0).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductCard;