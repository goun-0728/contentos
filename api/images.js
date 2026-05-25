// api/images.js
// Vercel Serverless Function for OpenAI Image API proxy.

import OpenAI from 'openai';

const MAX_BODY_BYTES = 512 * 1024;

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED', api: '/api/images' });
  }

  const bodyBytes = Buffer.byteLength(JSON.stringify(req.body || {}), 'utf8');
  if (bodyBytes > MAX_BODY_BYTES) {
    return res.status(413).json({
      error: 'Request payload too large',
      code: 'PAYLOAD_TOO_LARGE',
      api: '/api/images',
      bodyBytes,
    });
  }

  const {
    prompt,
    model = 'gpt-image-1',
    size = '1024x1536',
    quality = 'medium',
  } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt field is required', code: 'BAD_REQUEST', api: '/api/images' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured', code: 'MISSING_OPENAI_API_KEY', api: '/api/images' });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const image = await openai.images.generate({
      model,
      prompt,
      size,
      quality,
      n: 1,
    });

    const b64 = image.data?.[0]?.b64_json;
    const url = image.data?.[0]?.url;

    if (b64) return res.status(200).json({ image: `data:image/png;base64,${b64}`, api: '/api/images' });
    if (url) return res.status(200).json({ image: url, api: '/api/images' });

    return res.status(502).json({ error: 'Empty image response', code: 'EMPTY_IMAGE_RESPONSE', api: '/api/images' });
  } catch (e) {
    const status = e?.status || 500;
    const msg = e?.error?.message || e?.message || 'OpenAI Image API error';
    return res.status(status).json({ error: msg, code: e?.code || 'OPENAI_IMAGE_ERROR', api: '/api/images' });
  }
}
