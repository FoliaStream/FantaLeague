const BASE_URL = import.meta.env.VITE_API_URL

function getToken() {
  return localStorage.getItem('token')
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse(res) {
  if (res.status === 401) {
    const hadToken = !!localStorage.getItem('token')
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  
    const path = window.location.pathname
    const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password']
  
    if (hadToken && !publicPaths.includes(path)) {
      window.location.href = '/login'
    }
    throw new Error('Session expired')
  }
  if (!res.ok) throw new Error(`API error ${res.status}`)

  const text = await res.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Not valid JSON. Response starts with: ${text.slice(0, 80)}`)
  }
}

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() })
  return handleResponse(res)
}

export async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  return handleResponse(res)
}

export async function apiPut(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  return handleResponse(res)
}

export async function apiDelete(path) {
  const res = await fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: authHeaders() })
  return handleResponse(res)
}

// --- Auth ---

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await handleResponse(res)
  localStorage.setItem('token', data.token)
  localStorage.setItem('username', data.username)
  return data
}

export async function register(username, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  })
  const data = await handleResponse(res)
  localStorage.setItem('token', data.token)
  localStorage.setItem('username', data.username)
  return data
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
}

export function isLoggedIn() {
  return !!getToken()
}

export function getUsername() {
  return localStorage.getItem('username')
}

export async function forgotPassword(email) {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return handleResponse(res)
}

export async function resetPassword(token, password) {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })
  return handleResponse(res)
}