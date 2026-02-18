export function createClient(getToken) {
  async function request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
    if (options.headers && 'Content-Type' in options.headers && options.headers['Content-Type'] === undefined) {
      delete headers['Content-Type'];
    }
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(path, { ...options, headers })
    const text = await res.text()

    let data = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = text
      }
    }

    if (!res.ok) {
      const err = new Error('Request failed')
      err.status = res.status
      err.data = data
      throw err
    }

    return data
  }

  return {
    post: (p, b) => request(p, { method: 'POST', body: JSON.stringify(b) }),
    postFormData: (p, body) => request(p, {
      method: 'POST',
      body,
      headers: { 'Content-Type': undefined } // Fetch will set correctly for FormData
    }),
    put: (p, b) => request(p, { method: 'PUT', body: JSON.stringify(b) }),
    get: (p) => request(p, { method: 'GET' }),
    del: (p) => request(p, { method: 'DELETE' })
  }
}
