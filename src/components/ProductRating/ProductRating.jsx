import React from 'react';

const ProductRating = ({ rating, maxRating = 5, reviewCount }) => {
  const normalizedRating = Math.min(Math.max(0, Number(rating) || 0), maxRating);
  
  const displayRating = normalizedRating.toFixed(1);
  
  return (
    <div className="flex items-center mb-4">
      <div className="flex">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = normalizedRating >= starValue;
          const isHalfFilled = !isFilled && normalizedRating > starValue - 1;
          
          return (
            <span key={index} className="text-amber-400">
              {isFilled ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ) : isHalfFilled ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <defs>
                    <linearGradient id={`half-star-${index}`} x1="0" x2="100%" y1="0" y2="0">
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="#D1D5DB" />
                    </linearGradient>
                  </defs>
                  <path 
                    fill={`url(#half-star-${index})`}
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" 
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </span>
          );
        })}
      </div>
      
      <span className="ml-2 text-amber-500 font-medium">{displayRating}</span>
      
      {reviewCount !== undefined && (
        <span className="ml-2 text-gray-500">
          ({reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'})
        </span>
      )}
    </div>
  );
};

export default ProductRating;