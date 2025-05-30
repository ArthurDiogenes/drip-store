// src/components/CollectionCards/CollectionCards.jsx
import React from 'react';

const CollectionCard = ({
  discount,
  imageUrl,
  buttonText = "Comprar",
  link = "#"
}) => {
  return (
    <div className="relative rounded-lg overflow-hidden transition-transform hover:scale-[1.02]">
      {/* Imagem de fundo */}
      <div className="w-full">
        <img 
          src={imageUrl} 
          alt={buttonText} 
          className="w-full h-auto" 
        />
      </div>
      
      {/* Overlay para melhorar legibilidade do botão */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
      
      {/* Badge de desconto */}
      {discount && (
        <div className="absolute top-2 left-2 bg-lime-500 text-white text-xs font-semibold px-2 py-1 rounded">
          {discount}% OFF
        </div>
      )}
     
      {/* Botão Comprar posicionado na parte inferior */}
      <div className="absolute bottom-4 left-4 z-10">
        <a
          href={link}
          className="bg-pink-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-pink-700 transition-colors"
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
};

const CollectionCards = ({ collections = [] }) => {
  // Dados de coleções padrão caso não sejam fornecidos
  const defaultCollections = [
    {
      id: 1,
      discount: "30",
      imageUrl: "/images/collections/collection-1.png",
      buttonText: "Ver coleção",
      link: "/colecoes/supreme"
    },
    {
      id: 2,
      discount: "30",
      imageUrl: "/images/collections/collection-2.png",
      buttonText: "Ver coleção",
      link: "/colecoes/adidas"
    },
    {
      id: 3,
      discount: "30",
      imageUrl: "/images/collections/collection-3.png",
      buttonText: "Ver coleção",
      link: "/colecoes/beats"
    }
  ];

  // Usa as coleções fornecidas ou as padrão
  const collectionsToRender = collections.length > 0 ? collections : defaultCollections;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {collectionsToRender.map(collection => (
        <CollectionCard
          key={collection.id}
          discount={collection.discount}
          imageUrl={collection.imageUrl}
          buttonText={collection.buttonText || "Ver coleção"}
          link={collection.link}
        />
      ))}
    </div>
  );
};

export default CollectionCards;