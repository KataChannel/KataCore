'use client';

import { useState } from 'react';

interface HealthStatus {
  status?: string;
  timestamp?: string;
  service?: string;
  error?: string;
}

export default function ApiTest() {
  const [apiResponse, setApiResponse] = useState<string>('');
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      // Test main endpoint
      const response = await fetch('http://localhost:3001');
      const text = await response.text();
      setApiResponse(text);

      // Test health endpoint
      const healthResponse = await fetch('http://localhost:3001/health');
      const healthData = await healthResponse.json();
      setHealthStatus(healthData);
    } catch (error) {
      setApiResponse('Error connecting to API: ' + error);
      setHealthStatus({ error: 'Failed to connect' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">API Connection Test</h2>
      
      <button
        onClick={testApi}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>

      {apiResponse && (
        <div className="mt-4">
          <h3 className="font-semibold">API Response:</h3>
          <p className="bg-gray-100 dark:bg-gray-700 p-2 rounded">{apiResponse}</p>
        </div>
      )}

      {healthStatus && (
        <div className="mt-4">
          <h3 className="font-semibold">Health Status:</h3>
          <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm">
            {JSON.stringify(healthStatus, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
