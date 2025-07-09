// File: app/loading.tsx
'use client';
import React from 'react';
export default function Loading() {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
            }}
        >
            <span>Loading...</span>
        </div>
    );
}