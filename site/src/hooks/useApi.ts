import { useState, useCallback } from 'react';
import { ApiResponse, RequestOptions } from '../types/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export default function useApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const request = useCallback(
    async (
      url: string,
      options: RequestOptions = {}
    ): Promise<ApiResponse<T>> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(url, {
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Request failed');
        }

        setState({
          data: result.data,
          loading: false,
          error: null,
        });

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    []
  );

  const get = useCallback(
    (url: string, headers?: Record<string, string>) =>
      request(url, { method: 'GET', headers }),
    [request]
  );

  const post = useCallback(
    (url: string, body?: any, headers?: Record<string, string>) =>
      request(url, { method: 'POST', body, headers }),
    [request]
  );

  const put = useCallback(
    (url: string, body?: any, headers?: Record<string, string>) =>
      request(url, { method: 'PUT', body, headers }),
    [request]
  );

  const del = useCallback(
    (url: string, headers?: Record<string, string>) =>
      request(url, { method: 'DELETE', headers }),
    [request]
  );

  return {
    ...state,
    request,
    get,
    post,
    put,
    delete: del,
  };
}
