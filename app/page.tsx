import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          TazaCore
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Unified Business Management System
        </p>
        <div className="space-x-4">
          <a 
            href="/admin" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Admin Panel
          </a>
          <a 
            href="/api/admin/roles" 
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Test API
          </a>
        </div>
      </div>
    </div>
  );
}
