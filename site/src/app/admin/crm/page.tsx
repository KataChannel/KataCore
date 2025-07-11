'use client';
import { useState } from 'react';

export default function CRMPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      Xin Chào
    </div>
  );
}
