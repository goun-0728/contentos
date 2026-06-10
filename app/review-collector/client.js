const STORAGE_KEY = 'extension_review_claims'
const SETTINGS_KEY = 'extension_review_claim_settings'
const POLL_MS = 1500

const els = {
  itemName: document.querySelector('#itemName'),
  vendorName: document.querySelector('#vendorName'),
  saveSettings: document.querySelector('#saveSettings'),
  statusText: document.querySelector('#statusText'),
  count: document.querySelector('#count'),
  body: document.querySelector('#reviewBody'),
  downloadCsv: document.querySelector('#downloadCsv'),
  clearAll: document.querySelector('#clearAll'),
}

let reviews = loadReviews()
let settings = loadSettings()

init()

function init() {
  els.itemName.value = settings.itemName
  els.vendorName.value = settings.vendorName

  els.saveSettings.addEventListener('click', handleSaveSettings)
  els.downloadCsv.addEventListener('click', downloadCsv)
  els.clearAll.addEventListener('click', clearAll)

  render()
  fetchIncomingReviews()
  setInterval(fetchIncomingReviews, POLL_MS)
}

function loadReviews() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function loadSettings() {
  try {
    return {
      itemName: '',
      vendorName: '',
      ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'),
    }
  } catch {
    return { itemName: '', vendorName: '' }
  }
}

function handleSaveSettings() {
  settings = {
    itemName: els.itemName.value.trim(),
    vendorName: els.vendorName.value.trim(),
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  setStatus('기본값을 저장했습니다.')
}

function clearAll() {
  if (!window.confirm('저장된 리뷰를 모두 삭제하시겠습니까?')) return

  reviews = []
  persistReviews()
  render()
  setStatus('전체 데이터를 삭제했습니다.')
}

function persistReviews() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
}

function setStatus(message) {
  els.statusText.textContent = message
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

function normalizeReview(raw) {
  return {
    itemName: settings.itemName || String(raw.itemName || '').trim(),
    vendorName: settings.vendorName || String(raw.vendorName || '').trim(),
    productUrl: String(raw.productUrl || '').trim(),
    reviewText: String(raw.reviewText || '').replace(/\s+/g, ' ').trim(),
    collectedAt: raw.collectedAt || new Date().toISOString(),
    source: raw.source || 'naver-smartstore',
  }
}

function addReviews(incoming) {
  settings = loadSettings()
  const existing = new Set(reviews.map(makeKey))
  let added = 0

  for (const raw of incoming) {
    const review = normalizeReview(raw)
    if (review.reviewText.length < 10) continue

    const key = makeKey(review)
    if (existing.has(key)) continue

    existing.add(key)
    reviews.unshift(review)
    added += 1
  }

  if (!added) return

  persistReviews()
  render()
  setStatus(`새 리뷰 ${added}건을 저장했습니다.`)
}

async function fetchIncomingReviews() {
  try {
    const response = await fetch('/api/reviews')
    const payload = await response.json()

    if (payload.ok && Array.isArray(payload.reviews) && payload.reviews.length) {
      addReviews(payload.reviews)
    }
  } catch {
    setStatus('로컬 수신 서버와 연결을 확인하는 중입니다.')
  }
}

function render() {
  els.count.textContent = reviews.length

  if (!reviews.length) {
    els.body.innerHTML = '<tr><td class="empty" colspan="6">저장된 리뷰가 없습니다.</td></tr>'
    return
  }

  els.body.innerHTML = reviews.map(review => `
    <tr>
      <td>${formatDate(review.collectedAt)}</td>
      <td>${escapeHtml(review.itemName || '-')}</td>
      <td>${escapeHtml(review.vendorName || '-')}</td>
      <td>${review.productUrl ? `<a href="${escapeAttribute(review.productUrl)}" target="_blank" rel="noreferrer">열기</a>` : '-'}</td>
      <td class="review-text">${escapeHtml(review.reviewText)}</td>
      <td>${escapeHtml(review.source)}</td>
    </tr>
  `).join('')
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return value || ''
  }
}

function dateStamp() {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

function downloadCsv() {
  const headers = ['수집일시', '품목명', '업체명', '상품URL', '리뷰내용', '출처']
  const rows = reviews.map(review => [
    review.collectedAt,
    review.itemName,
    review.vendorName,
    review.productUrl,
    review.reviewText,
    review.source,
  ])
  const csv = [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = `review-claims-${dateStamp()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#096;')
}
