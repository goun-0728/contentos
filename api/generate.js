// api/generate.js
// Vercel Serverless Function for OpenAI chat generation.

import OpenAI from 'openai';

const MAX_BODY_BYTES = 4 * 1024 * 1024;

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED', api: '/api/generate' });
  }

  const bodyBytes = Buffer.byteLength(JSON.stringify(req.body || {}), 'utf8');
  if (bodyBytes > MAX_BODY_BYTES) {
    return res.status(413).json({
      error: 'Request payload too large',
      code: 'PAYLOAD_TOO_LARGE',
      api: '/api/generate',
      bodyBytes,
    });
  }

  const { messages, model = 'gpt-4o', max_tokens = 4000 } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages field is required', code: 'BAD_REQUEST', api: '/api/generate' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured', code: 'MISSING_OPENAI_API_KEY', api: '/api/generate' });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model,
      max_tokens,
      messages,
    });

    const text = completion.choices?.[0]?.message?.content || '';
    return res.status(200).json({ text, api: '/api/generate' });
  } catch (e) {
    const status = e?.status || 500;
    const msg = e?.error?.message || e?.message || 'OpenAI API error';
    return res.status(status).json({ error: msg, code: e?.code || 'OPENAI_ERROR', api: '/api/generate' });
  }
}
