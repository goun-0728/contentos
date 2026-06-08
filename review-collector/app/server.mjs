import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || 4174)
const DATA_PATH = path.resolve(__dirname, '../reviews.json')
const CSV_PATH  = path.resolve(__dirname, '../reviews.csv')
const CSV_HEADERS = ['품목명', '업체명', '상품URL', '리뷰내용', '수집일시', '출처']

/* ── CORS ── */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function send(res, status, body, type = 'text/html; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, ...CORS })
  res.end(body)
}
function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload), 'application/json; charset=utf-8')
}
async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

/* ── 리뷰 저장소 ── */
async function loadReviews() {
  try { return JSON.parse(await fs.readFile(DATA_PATH, 'utf8')) } catch { return [] }
}
async function saveReviews(reviews) {
  await fs.writeFile(DATA_PATH, JSON.stringify(reviews, null, 2), 'utf8')
}
function makeKey(r) {
  return [r.itemName, r.vendorName, r.productUrl, r.reviewText].join('|').replace(/\s+/g, '').toLowerCase()
}

/* ── CSV ── */
function esc(v) { const s = String(v ?? ''); return `"${s.replaceAll('"', '""')}"` }
async function appendCsv(rows) {
  if (!rows.length) return
  let exists = true
  try { await fs.access(CSV_PATH) } catch { exists = false }
  const fieldMap = r => ({ 품목명: r.itemName, 업체명: r.vendorName, 상품URL: r.productUrl, 리뷰내용: r.reviewText, 수집일시: r.collectedAt, 출처: r.source })
  const lines = rows.map(r => CSV_HEADERS.map(h => esc(fieldMap(r)[h])).join(','))
  if (!exists) {
    await fs.writeFile(CSV_PATH, `﻿${CSV_HEADERS.map(esc).join(',')}\n${lines.join('\n')}\n`, 'utf8')
  } else {
    await fs.appendFile(CSV_PATH, `${lines.join('\n')}\n`, 'utf8')
  }
}

/* ── 라우트 핸들러 ── */
async function handleReceive(req, res) {
  try {
    const body   = await readBody(req)
    const incoming = Array.isArray(body.reviews) ? body.reviews : []
    const existing = await loadReviews()
    const existingKeys = new Set(existing.map(makeKey))
    const newOnes = incoming.filter(r => !existingKeys.has(makeKey(r)))
    await saveReviews([...existing, ...newOnes])
    await appendCsv(newOnes)
    sendJson(res, 200, { ok: true, received: incoming.length, saved: newOnes.length, skipped: incoming.length - newOnes.length })
  } catch (e) {
    sendJson(res, 400, { ok: false, message: e.message })
  }
}
async function handleGetAll(res) {
  sendJson(res, 200, await loadReviews())
}
async function handleCsv(res) {
  try {
    const csv = await fs.readFile(CSV_PATH)
    res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="reviews.csv"', ...CORS })
    res.end(csv)
  } catch {
    send(res, 404, '아직 수집된 리뷰가 없습니다.', 'text/plain; charset=utf-8')
  }
}

/* ── 서버 ── */
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); res.end(); return }
  if (req.method === 'GET'  && req.url === '/')             { send(res, 200, HTML); return }
  if (req.method === 'POST' && req.url === '/api/reviews')  { await handleReceive(req, res); return }
  if (req.method === 'GET'  && req.url === '/api/reviews')  { await handleGetAll(res); return }
  if (req.method === 'GET'  && req.url === '/reviews.csv')  { await handleCsv(res); return }
  send(res, 404, '페이지를 찾을 수 없습니다.', 'text/plain; charset=utf-8')
})

server.listen(PORT, () => {
  console.log(`리뷰 클레임 수집기: http://localhost:${PORT}`)
})

/* ── HTML UI ── */
const HTML = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>리뷰 클레임 수집기</title>
  <style>
    *{box-sizing:border-box}
    body{margin:0;background:#f4f6f9;color:#172033;font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif}
    header{background:#fff;border-bottom:1px solid #dce2ea;padding:28px 22px}
    .wrap{width:min(1100px,calc(100% - 36px));margin:0 auto}
    h1{margin:0;font-size:26px;color:#0f2744}
    .sub{color:#667487;margin:6px 0 0;line-height:1.6}
    main{padding:22px 0 60px}
    .status-bar{background:#fff;border:1px solid #dce2ea;border-radius:8px;padding:18px 22px;margin-bottom:16px;display:flex;align-items:center;gap:12px}
    .dot{width:10px;height:10px;border-radius:50%;background:#22c55e;animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    .status-text{color:#315475;font-weight:600}
    .panel{background:#fff;border:1px solid #dce2ea;border-radius:8px;padding:22px;margin-bottom:16px}
    h2{margin:0 0 14px;font-size:18px;color:#0f2744}
    .row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}
    label{display:grid;gap:5px;font-weight:700;color:#26384f;font-size:14px;flex:1;min-width:160px}
    input{width:100%;border:1px solid #cfd7e3;border-radius:6px;background:#f8fafc;color:#172033;padding:10px;font:inherit}
    input:focus{outline:none;border-color:#183a5a;background:#fff}
    .actions{display:flex;gap:10px;margin-top:4px}
    button,a.btn{display:inline-flex;align-items:center;justify-content:center;min-height:40px;border:0;border-radius:7px;background:#102a46;color:#fff;padding:0 16px;font:inherit;font-weight:700;text-decoration:none;cursor:pointer;font-size:14px}
    a.btn.sec{background:#eef2f6;color:#213a56;border:1px solid #c8d2df}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{background:#f1f4f8;padding:9px 10px;text-align:left;font-weight:700;color:#315475;border-bottom:2px solid #dce2ea}
    td{padding:9px 10px;border-bottom:1px solid #eef2f6;vertical-align:top;color:#26384f}
    tr:hover td{background:#fafbfc}
    .empty{text-align:center;color:#9ca3af;padding:40px}
    .cnt{font-size:13px;color:#667487;margin-bottom:8px}
    .url-cell{max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .review-cell{max-width:400px}
  </style>
</head>
<body>
<header>
  <div class="wrap">
    <h1>리뷰 클레임 수집기</h1>
    <p class="sub">크롬 확장프로그램으로 수집된 리뷰를 저장하고 CSV로 내보냅니다.</p>
  </div>
</header>
<main class="wrap">

  <div class="status-bar">
    <div class="dot"></div>
    <span class="status-text">확장프로그램에서 전송된 리뷰 수신 대기 중 — localhost:${PORT}/api/reviews</span>
  </div>

  <div class="panel">
    <h2>기본값 설정 <span style="font-weight:400;font-size:13px;color:#9ca3af">(확장프로그램의 초기값으로 사용)</span></h2>
    <div class="row">
      <label>품목명 <input id="itemName" placeholder="예: 김치" oninput="saveDefaults()"/></label>
      <label>업체명 <input id="vendorName" placeholder="예: 경쟁사A" oninput="saveDefaults()"/></label>
    </div>
  </div>

  <div class="panel">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <h2 style="margin:0">수집된 리뷰 <span id="cnt" class="cnt"></span></h2>
      <div class="actions" style="margin:0">
        <button onclick="clearAll()" style="background:#fef2f2;color:#ef4444;border:1px solid #fca5a5">전체 삭제</button>
        <a class="btn sec" href="/reviews.csv">↓ CSV 다운로드</a>
      </div>
    </div>
    <div id="tableWrap">
      <div class="empty">수집된 리뷰가 없습니다.<br/>크롬 확장프로그램을 실행해주세요.</div>
    </div>
  </div>

</main>
<script>
  const POLL_MS = 4000

  function saveDefaults() {
    localStorage.setItem('review_itemName',   document.getElementById('itemName').value)
    localStorage.setItem('review_vendorName', document.getElementById('vendorName').value)
  }
  function loadDefaults() {
    document.getElementById('itemName').value   = localStorage.getItem('review_itemName')   || ''
    document.getElementById('vendorName').value = localStorage.getItem('review_vendorName') || ''
  }

  async function clearAll() {
    if (!confirm('모든 리뷰를 삭제하시겠습니까?')) return
    await fetch('/api/reviews', { method: 'DELETE' }).catch(() => {})
    location.reload()
  }

  function renderTable(reviews) {
    const cnt = document.getElementById('cnt')
    cnt.textContent = reviews.length ? reviews.length + '건' : ''
    const wrap = document.getElementById('tableWrap')
    if (!reviews.length) {
      wrap.innerHTML = '<div class="empty">수집된 리뷰가 없습니다.<br/>크롬 확장프로그램을 실행해주세요.</div>'
      return
    }
    const rows = [...reviews].reverse().map(r => \`
      <tr>
        <td>\${esc(r.itemName)}</td>
        <td>\${esc(r.vendorName)}</td>
        <td class="url-cell" title="\${esc(r.productUrl)}"><a href="\${esc(r.productUrl)}" target="_blank" rel="noopener">\${esc(r.productUrl)}</a></td>
        <td class="review-cell">\${esc(r.reviewText)}</td>
        <td>\${esc((r.collectedAt||'').replace('T',' ').slice(0,16))}</td>
      </tr>\`).join('')
    wrap.innerHTML = \`
      <table>
        <thead><tr><th>품목명</th><th>업체명</th><th>상품URL</th><th>리뷰내용</th><th>수집일시</th></tr></thead>
        <tbody>\${rows}</tbody>
      </table>\`
  }

  function esc(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  }

  let lastCount = -1
  async function poll() {
    try {
      const res = await fetch('/api/reviews')
      const data = await res.json()
      if (data.length !== lastCount) { lastCount = data.length; renderTable(data) }
    } catch {}
    setTimeout(poll, POLL_MS)
  }

  loadDefaults()
  poll()
</script>
</body>
</html>`
