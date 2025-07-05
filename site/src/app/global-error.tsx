'use client';
import React from 'react';
interface GlobalErrorProps {
    error: Error;
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    console.error('Global error:', error);

    return (
        <html>
            <head>
                <title>Error Occurred</title>
            </head>
            <body style={{ margin: 0, padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#f8f8f8' }}>
                <div style={{ maxWidth: '600px', margin: 'auto', textAlign: 'center' }}>
                    <h1>Something went wrong!</h1>
                    <p>{error.message}</p>
                    <button 
                        onClick={reset} 
                        style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
                    >
                        Try Again
                    </button>
                </div>
            </body>
        </html>
    );
}