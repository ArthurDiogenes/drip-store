import React from 'react';

const SizeSelector = ({ sizes, selectedSize, onSizeSelect }) => {
  if (!sizes || sizes.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Tamanho</h3>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            className={`
              h-10 w-10 flex items-center justify-center rounded-md
              transition-colors duration-200
              ${selectedSize === size 
                ? 'bg-pink-600 text-white border-pink-600' 
                : 'bg-white text-gray-800 border border-gray-300 hover:border-pink-300'
              }
            `}
            onClick={() => onSizeSelect(size)}
            aria-pressed={selectedSize === size}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;