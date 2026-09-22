const BASE_URL = import.meta.env.VITE_API_URL

async function handleResponse(res) {
  if (!res.ok) throw new Error(`API error ${res.status}`)

  const text = await res.text()
  if (!text) return null // e.g. 204 No Content

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Not valid JSON. Response starts with: ${text.slice(0, 80)}`)
  }
}

export async function apiGet(path) {
  const url = `${BASE_URL}${path}`
  console.log('Fetching', url)

  const res = await fetch(url)
  return handleResponse(res)
}

export async function apiPost(path, body) {
  const url = `${BASE_URL}${path}`
  console.log('Posting', url, body)

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse(res)
}

export async function apiPut(path, body) {
  const url = `${BASE_URL}${path}`
  console.log('Putting', url, body)

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse(res)
}

export async function apiDelete(path) {
  const url = `${BASE_URL}${path}`
  console.log('Deleting', url)

  const res = await fetch(url, { method: 'DELETE' })
  return handleResponse(res)
}