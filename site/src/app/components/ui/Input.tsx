import React from 'react';

interface InputProps {
    // Define your component props here
    message?: string;
}

const Input: React.FC<InputProps> = ({ message = 'Hello from Input!' }) => {
    return (
        <div className="p-4 border rounded shadow">
            <p>{message}</p>
        </div>
    );
};

export default Input;