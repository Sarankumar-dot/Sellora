import axios from 'axios'
import {
  getAccessToken,
  handleUnauthorized,
  refreshAccessToken,
} from '@/api/authSession.js'
import { env } from '@/config/env.js'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  timeout: 15_000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token && !config.skipAuthorization) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const PUBLIC_AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-reset-otp',
  '/auth/resend-reset-otp',
]

const isPublicAuthEndpoint = (url) => {
  if (!url) return false
  return PUBLIC_AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint))
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest.skipAuthRefresh ||
      originalRequest._retry ||
      isPublicAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    const token = await refreshAccessToken()

    if (!token) {
      await handleUnauthorized()
      return Promise.reject(error)
    }

    originalRequest.headers.Authorization = `Bearer ${token}`
    return apiClient(originalRequest)
  }
)
