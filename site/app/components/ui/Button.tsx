import React from 'react';

interface ButtonProps {
    // Define your component props here
    message?: string;
}

const Button: React.FC<ButtonProps> = ({ message = 'Hello from Button!' }) => {
    return (
        <div className="p-4 border rounded shadow">
            <p>{message}</p>
        </div>
    );
};

export default Button;