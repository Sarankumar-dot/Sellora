import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  clearAuthSessionHandlers,
  configureAuthSession,
  setAccessToken as setApiAccessToken,
} from '@/api/authSession.js'
import { apiClient } from '@/api/axios.js'
import { queryClient } from '@/config/queryClient.js'
import { AuthContext } from '@/context/authContext.js'

const getResponseData = (response) => response.data?.data

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const accessTokenRef = useRef(null)
  const refreshPromiseRef = useRef(null)
  const restorePromiseRef = useRef(null)

  const updateAccessToken = useCallback((token) => {
    const nextToken = token || null
    accessTokenRef.current = nextToken
    setApiAccessToken(nextToken)
    setAccessToken(nextToken)
  }, [])

  const clearSession = useCallback(() => {
    updateAccessToken(null)
    setUser(null)
    queryClient.clear()
  }, [updateAccessToken])

  const fetchCurrentUser = useCallback(async () => {
    if (!accessTokenRef.current) {
      return null
    }

    const response = await apiClient.get('/auth/me')
    const currentUser = getResponseData(response)

    if (!currentUser) {
      throw new Error('The current user response did not contain user data.')
    }

    setUser(currentUser)
    return currentUser
  }, [])

  const refreshSession = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current
    }

    const refreshPromise = apiClient
      .post('/auth/refresh-token', undefined, { skipAuthRefresh: true, skipAuthorization: true })
      .then((response) => {
        const token = getResponseData(response)?.token

        if (!token) {
          throw new Error('The refresh response did not contain an access token.')
        }

        updateAccessToken(token)
        return token
      })
      .catch(() => {
        clearSession()
        return null
      })
      .finally(() => {
        refreshPromiseRef.current = null
      })

    refreshPromiseRef.current = refreshPromise
    return refreshPromise
  }, [clearSession, updateAccessToken])

  const restoreSession = useCallback(async () => {
    if (restorePromiseRef.current) {
      return restorePromiseRef.current
    }

    const restorePromise = (async () => {
      setIsLoading(true)

      try {
        const token = await refreshSession()

        if (token) {
          await fetchCurrentUser()
        }
      } catch {
        clearSession()
      } finally {
        setIsLoading(false)
        restorePromiseRef.current = null
      }
    })()

    restorePromiseRef.current = restorePromise
    return restorePromise
  }, [clearSession, fetchCurrentUser, refreshSession])

  const login = useCallback(
    async (credentials) => {
      const response = await apiClient.post('/auth/login', credentials, {
        skipAuthRefresh: true,
        skipAuthorization: true,
      })
      const session = getResponseData(response)

      if (!session?.token) {
        throw new Error('The login response did not contain an access token.')
      }

      updateAccessToken(session.token)
      setUser(session.user ?? null)

      try {
        return await fetchCurrentUser()
      } catch (error) {
        clearSession()
        throw error
      }
    },
    [clearSession, fetchCurrentUser, updateAccessToken]
  )

  const register = useCallback(async (userData) => {
    const response = await apiClient.post('/auth/register', userData, {
      skipAuthRefresh: true,
      skipAuthorization: true,
    })

    return getResponseData(response)
  }, [])

  const forgotPassword = useCallback(async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email }, {
      skipAuthRefresh: true,
      skipAuthorization: true,
    })

    return getResponseData(response)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', undefined, {
        skipAuthRefresh: true,
        skipAuthorization: true,
      })
    } finally {
      clearSession()
    }
  }, [clearSession])

  const logoutAll = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout-all', undefined, { skipAuthRefresh: true })
    } finally {
      clearSession()
    }
  }, [clearSession])

  useEffect(() => {
    configureAuthSession({ onRefresh: refreshSession, onUnauthorized: clearSession })
    return clearAuthSessionHandlers
  }, [clearSession, refreshSession])

  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      login,
      register,
      forgotPassword,
      logout,
      logoutAll,
      refreshSession,
      fetchCurrentUser,
    }),
    [accessToken, fetchCurrentUser, forgotPassword, isLoading, login, logout, logoutAll, refreshSession, register, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
