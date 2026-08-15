import axios from 'axios';

let inMemoryToken = null;
let refreshTokenPromise = null;

export const setAccessToken = (token) => {
  inMemoryToken = token;
};

export const getAccessToken = () => {
  return inMemoryToken;
};

export const notifySessionExpired = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:session-expired'));
  }
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
});

// Request Interceptor: Attach Bearer token from memory
apiClient.interceptors.request.use(
  (config) => {
    if (inMemoryToken) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 with a shared in-flight refresh promise to prevent concurrent race conditions
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on login, register, or refresh-token requests themselves
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;

      // If a refresh request is not already in flight, launch a single shared refresh promise
      if (!refreshTokenPromise) {
        refreshTokenPromise = apiClient
          .post('/auth/refresh-token')
          .then((res) => {
            const payload = res.data?.data || res.data;
            const newToken = payload?.token || payload?.accessToken;
            if (!newToken) {
              throw new Error('No token returned from refresh');
            }
            setAccessToken(newToken);
            return newToken;
          })
          .catch((err) => {
            setAccessToken(null);
            notifySessionExpired();
            throw err;
          })
          .finally(() => {
            refreshTokenPromise = null;
          });
      }

      try {
        const newToken = await refreshTokenPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Shared helper to unwrap standard backend response format
 * Backend returns { success, statusCode, message, data } — callers need `data`.
 */
export const unwrapResponse = (response) => {
  const body = response.data;
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data;
  }
  return body;
};
