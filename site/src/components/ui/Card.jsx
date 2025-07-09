// components/ui/Card.jsx
import React from 'react';
const Card = ({ title, description, imageUrl }) => {
  return (
    <div className="border rounded shadow-lg p-4">
      {imageUrl && <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />}
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};
export default Card;