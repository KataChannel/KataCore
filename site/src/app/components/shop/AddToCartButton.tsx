import React from 'react';

interface AddToCartButtonProps {
    // Define your component props here
    message?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ message = 'Hello from AddToCartButton!' }) => {
    return (
        <div className="p-4 border rounded shadow">
            <p>{message}</p>
        </div>
    );
};

export default AddToCartButton;