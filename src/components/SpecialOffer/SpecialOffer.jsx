import React from 'react';

const SpecialOffer = ({
  title = "Air Jordan edição de colecionador",
  description = "Descubra a edição limitada do Air Jordan com design exclusivo e tecnologia de ponta. Conforto superior e estilo incomparável para verdadeiros colecionadores e amantes de sneakers de alta performance.",
  imageUrl = "../images/products/produc-image-6.jpeg",
  buttonText = "Ver Oferta",
  buttonLink = "#"
}) => {
  return (
    <div className="bg-purple-50 rounded-lg overflow-hidden w-full">
      <div className="flex flex-col md:flex-row w-full">
        <div className="w-full md:w-1/3 p-6 flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt={title} 
            className="max-w-full h-auto object-contain"
          />
        </div>
        <div className="w-full md:w-2/3 p-8 flex flex-col justify-center">
          <div className="mb-2">
            <span className="text-pink-600 text-sm font-medium">Oferta especial</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {title}
          </h2>
          <p className="text-gray-600 mb-6">
            {description}
          </p>
          <a 
            href={buttonLink} 
            className="bg-pink-600 text-white hover:text-white py-2 px-6 rounded-md font-medium inline-block hover:bg-pink-700 transition-colors w-fit"
          >
            {buttonText}
          </a>
        </div>
      </div>
    </div>
  );
};

export default SpecialOffer;