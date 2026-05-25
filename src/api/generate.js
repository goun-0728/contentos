// src/api/generate.js
// Client helper for the Vercel GPT API route.

import { estimatePayloadBytes, parseApiResponse } from './http'

const MAX_GENERATE_PAYLOAD_BYTES = 3.5 * 1024 * 1024

export async function generateContent({ systemPrompt, userPrompt, images = [], model = 'gpt-4o', maxTokens = 4000 }) {
  const userContent = []

  for (const imgDataUrl of images.slice(0, 2)) {
    if (!imgDataUrl) continue
    userContent.push({
      type: 'image_url',
      image_url: { url: imgDataUrl, detail: 'low' },
    })
  }

  userContent.push({ type: 'text', text: userPrompt })

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ]

  const body = { messages, model, max_tokens: maxTokens }
  const payloadBytes = estimatePayloadBytes(body)
  if (payloadBytes > MAX_GENERATE_PAYLOAD_BYTES) {
    const err = new Error('Uploaded images are too large. Please upload smaller images or allow automatic compression.')
    err.code = 'PAYLOAD_TOO_LARGE'
    err.payloadBytes = payloadBytes
    throw err
  }

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await parseApiResponse(res, '/api/generate')
  return data.text
}
