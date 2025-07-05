// components/ui/ProductCard.jsx
import React from 'react';

const ProductCard = ({ name, price, image }) => {
  return (
    <div className="border p-4 rounded-lg">
      <img src={image} alt={name} className="w-full h-32 object-cover" />
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-gray-700">${price}</p>
    </div>
  );
};

export default ProductCard;