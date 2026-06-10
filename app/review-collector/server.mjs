import express from 'express'
import cors from 'cors'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || 4174)
const DEBUG_HTML_PATH = path.join(__dirname, 'review-debug.html')
const pendingReviews = []

const app = express()

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}))
app.use(express.json({ limit: '2mb' }))
app.use(express.static(__dirname))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.post('/api/reviews', (req, res) => {
  const incoming = Array.isArray(req.body?.reviews) ? req.body.reviews : []
  const existingKeys = new Set(pendingReviews.map(makeKey))
  const accepted = []

  for (const raw of incoming) {
    const review = normalizeReview(raw)
    if (review.reviewText.length < 10) continue

    const key = makeKey(review)
    if (existingKeys.has(key)) continue

    existingKeys.add(key)
    pendingReviews.push(review)
    accepted.push(review)
  }

  res.json({
    ok: true,
    received: incoming.length,
    accepted: accepted.length,
    reviews: accepted,
  })
})

app.get('/api/reviews', (req, res) => {
  const reviews = pendingReviews.splice(0, pendingReviews.length)
  res.json({ ok: true, reviews })
})

app.post('/api/debug-html', async (req, res) => {
  const html = String(req.body?.html || '')

  if (!html.trim()) {
    res.status(400).json({ ok: false, message: '저장할 HTML이 없습니다.' })
    return
  }

  await fs.writeFile(DEBUG_HTML_PATH, html.slice(0, 500000), 'utf8')
  res.json({
    ok: true,
    path: DEBUG_HTML_PATH,
  })
})

function normalizeReview(raw) {
  return {
    itemName: String(raw?.itemName || '').trim(),
    vendorName: String(raw?.vendorName || '').trim(),
    productUrl: String(raw?.productUrl || '').trim(),
    reviewText: String(raw?.reviewText || '').replace(/\s+/g, ' ').trim(),
    collectedAt: raw?.collectedAt || new Date().toISOString(),
    source: raw?.source || 'naver-smartstore',
  }
}

function makeKey(review) {
  return [
    review.itemName,
    review.vendorName,
    review.productUrl,
    review.reviewText,
    review.source,
  ].join('|').toLowerCase()
}

app.listen(PORT, () => {
  console.log('리뷰 클레임 수집기 실행 중')
  console.log(`http://localhost:${PORT}`)
})
