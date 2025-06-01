import React from 'react';

const ProductPrice = ({ currentPrice, originalPrice }) => {
  const formatPrice = (price) => {
    return typeof price === 'number' 
      ? price.toFixed(2).replace('.', ',') 
      : price;
  };

  const discountPercentage = originalPrice && currentPrice 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : null;

  return (
    <div className="mb-6">
      <div className="flex items-end">
        <span className="text-gray-800 mr-2">
          <span className="text-sm text-gray-500">R$</span>
          <span className="text-3xl font-bold"> {formatPrice(currentPrice)}</span>
        </span>
        
        {originalPrice && currentPrice < originalPrice && (
          <span className="text-gray-500 line-through text-sm">
            R$ {formatPrice(originalPrice)}
          </span>
        )}
      </div>
      
      {discountPercentage && discountPercentage > 0 && (
        <div className="text-green-600 text-sm font-medium mt-1">
          {discountPercentage}% de desconto
        </div>
      )}
    </div>
  );
};

export default ProductPrice;