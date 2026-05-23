// api/images.js
// Vercel Serverless Function — OpenAI Image API proxy

import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    prompt,
    model = 'gpt-image-1',
    size = '1024x1536',
    quality = 'medium',
  } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt 필드가 필요합니다' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY가 설정되어 있지 않습니다' });
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

    if (b64) return res.status(200).json({ image: `data:image/png;base64,${b64}` });
    if (url) return res.status(200).json({ image: url });

    return res.status(502).json({ error: '이미지 응답이 비어 있습니다' });
  } catch (e) {
    const status = e?.status || 500;
    const msg = e?.error?.message || e?.message || 'OpenAI Image API 오류';
    return res.status(status).json({ error: msg });
  }
}
