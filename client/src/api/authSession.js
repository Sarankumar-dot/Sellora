let accessToken = null
let refreshHandler = null
let unauthorizedHandler = null

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token) {
  accessToken = token || null
}

export function configureAuthSession({ onRefresh, onUnauthorized }) {
  refreshHandler = onRefresh
  unauthorizedHandler = onUnauthorized
}

export function clearAuthSessionHandlers() {
  refreshHandler = null
  unauthorizedHandler = null
}

export async function refreshAccessToken() {
  return refreshHandler?.() ?? null
}

export async function handleUnauthorized() {
  await unauthorizedHandler?.()
}
