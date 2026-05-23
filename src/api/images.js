// src/api/images.js
// Client helper for server-side image generation.

export async function generateImage({ prompt, size = '1024x1536', quality = 'medium' }) {
  const res = await fetch('/api/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, size, quality }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  if (!data.image) {
    throw new Error('이미지 결과가 비어 있습니다');
  }

  return data.image;
}
