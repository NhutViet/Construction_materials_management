import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { isSupabaseConfigured } from '../lib/supabase';

interface RequestConfig {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  responseType?: string;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  config?: any;
}

/**
 * Adapter thay thế AxiosInstance.
 *
 * - Khi có VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY: mọi request đi qua Supabase.
 * - Khi chưa có: giữ nguyên hành vi cũ (gọi backend localhost:3000) để không vỡ lúc dev.
 *
 * Chữ ký giữ nguyên để 8 Redux slice không phải sửa gì.
 */
const createApiClient = (token = '', contentType = 'application/json', isPublic = false) => {
  if (!isSupabaseConfigured) {
    return createFallbackClient(token, contentType, isPublic);
  }

  const request = async (
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    path: string,
    body?: any,
    config?: RequestConfig
  ): Promise<ApiResponse> => {
    const { supabaseRequest } = await import('./supabaseRequest');
    const data = await supabaseRequest({ method, path, body, params: config?.params, isPublic });
    return { data, status: 200, headers: {}, config };
  };

  return {
    get: (path: string, config?: RequestConfig) => request('GET', path, undefined, config),
    post: (path: string, body?: any, config?: RequestConfig) => request('POST', path, body, config),
    patch: (path: string, body?: any, config?: RequestConfig) => request('PATCH', path, body, config),
    put: (path: string, body?: any, config?: RequestConfig) => request('PUT', path, body, config),
    delete: (path: string, config?: RequestConfig) => request('DELETE', path, undefined, config),
  };
};

/** Nhánh fallback: backend REST cũ, giữ nguyên interceptor cũ. */
const createFallbackClient = (token = '', contentType = 'application/json', isPublic = false) => {
  const axiosInstance = axios.create({
    baseURL: (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/',
  });

  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (isPublic) {
        config.headers.set('Accept', 'application/json');
        config.headers.set('Content-Type', contentType);
        return config;
      }

      let authToken = token;
      if (!authToken) {
        try {
          const savedToken = localStorage.getItem('accessToken');
          if (savedToken) authToken = JSON.parse(savedToken);
        } catch (error) {
          console.error('Error parsing token from localStorage:', error);
        }
      }

      if (authToken && authToken.trim() !== '') {
        config.headers.set('Authorization', `Bearer ${authToken}`);
      }
      config.headers.set('Accept', 'application/json');
      config.headers.set('Content-Type', contentType);
      return config;
    },
    (err) => Promise.reject(err)
  );

  axiosInstance.interceptors.response.use(
    (res: AxiosResponse) => res,
    async (err: AxiosError) => {
      if (err.response?.status === 401 && !isPublic) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }
  );

  return axiosInstance;
};

export default createApiClient;
