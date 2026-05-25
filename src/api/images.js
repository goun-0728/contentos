// src/api/images.js
// Client helper for server-side image generation.

import { estimatePayloadBytes, parseApiResponse } from './http'

const MAX_IMAGE_PAYLOAD_BYTES = 512 * 1024

export async function generateImage({ prompt, size = '1024x1536', quality = 'medium' }) {
  const body = { prompt, size, quality }
  if (estimatePayloadBytes(body) > MAX_IMAGE_PAYLOAD_BYTES) {
    const err = new Error('/api/images: Image prompt payload is too large.')
    err.code = 'PAYLOAD_TOO_LARGE'
    throw err
  }

  const res = await fetch('/api/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await parseApiResponse(res, '/api/images')
  if (!data.image) throw new Error('/api/images: Empty image result')
  return data.image
}
