import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { setStoredAccessToken, clearStoredTokens } from './secureStorage';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  notifyUnauthorized,
  setAccessToken,
} from './tokenStore';

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong') {
  const data = (err as AxiosError<any>)?.response?.data;
  if (!data) return fallback;
  if (typeof data.message === 'string') return data.message;
  if (data.validationErrors?.length) return data.validationErrors[0].message;
  if (typeof data.error === 'string') return data.error;
  return fallback;
}

export function getApiErrorCode(err: unknown): string | undefined {
  return (err as AxiosError<any>)?.response?.data?.code;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const apiClient = axios.create({ baseURL: API_URL });

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const response = await axios.post(`${API_URL}/expensify/auth/refresh-token`, { refreshToken });
  const newAccessToken = response.data.accessToken as string;
  setAccessToken(newAccessToken);
  await setStoredAccessToken(newAccessToken);
  return newAccessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newAccessToken = await refreshPromise;
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearTokens();
      await clearStoredTokens();
      notifyUnauthorized();
      return Promise.reject(refreshError);
    }
  },
);
