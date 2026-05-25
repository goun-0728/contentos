export async function parseApiResponse(response, apiName = 'API') {
  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : { error: await response.text().catch(() => '') }

  if (!response.ok) {
    const message = payload?.error || payload?.message || `HTTP ${response.status}`
    const code = payload?.code ? ` (${payload.code})` : ''
    throw new Error(`${apiName}: ${message}${code}`)
  }

  return payload
}

export function estimatePayloadBytes(value) {
  return new TextEncoder().encode(JSON.stringify(value)).length
}
