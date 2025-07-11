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
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Customer Relationship Management
            </h1>
            <p
              className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Manage your customers and relationships
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                : 'bg-white border-gray-300 hover:bg-gray-100'
            }`}
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div
            className={`p-4 sm:p-6 rounded-lg border transition-colors duration-200 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <h3 className="text-sm sm:text-lg font-semibold mb-2">
              Total Customers
            </h3>
            <p
              className={`text-2xl sm:text-3xl font-bold ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              0
            </p>
          </div>
          <div
            className={`p-4 sm:p-6 rounded-lg border transition-colors duration-200 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <h3 className="text-sm sm:text-lg font-semibold mb-2">
              Active Leads
            </h3>
            <p
              className={`text-2xl sm:text-3xl font-bold ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              0
            </p>
          </div>
          <div
            className={`p-4 sm:p-6 rounded-lg border transition-colors duration-200 sm:col-span-2 lg:col-span-1 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <h3 className="text-sm sm:text-lg font-semibold mb-2">
              Conversions
            </h3>
            <p
              className={`text-2xl sm:text-3xl font-bold ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              0
            </p>
          </div>
        </div>

        {/* Customer List */}
        <div
          className={`rounded-lg border transition-colors duration-200 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div
            className={`p-4 sm:p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-0">
                Customer List
              </h2>
              <button
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                Add Customer
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                <p className="mt-2">Loading...</p>
              </div>
            ) : customers.length === 0 ? (
              <div
                className={`text-center py-8 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                No customers found. Add your first customer to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr
                      className={`border-b ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}
                    >
                      <th className="text-left py-3 px-2 font-semibold text-sm sm:text-base">
                        Name
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-sm sm:text-base">
                        Email
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-sm sm:text-base hidden sm:table-cell">
                        Phone
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-sm sm:text-base">
                        Status
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-sm sm:text-base">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>{/* Customer rows will be rendered here */}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
