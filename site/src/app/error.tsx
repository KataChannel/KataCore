'use client';
import { useEffect } from 'react';
type ErrorProps = {
    error: Error;
    reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Something went wrong!</h2>
            <p>{error.message}</p>
            <button onClick={() => reset()} style={{ marginTop: '1rem' }}>
                Try Again
            </button>
        </div>
    );
}