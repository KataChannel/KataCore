import React from 'react';

interface ProductCardProps {
    // Define your component props here
    message?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ message = 'Hello from ProductCard!' }) => {
    return (
        <div className="p-4 border rounded shadow">
            <p>{message}</p>
        </div>
    );
};

export default ProductCard;