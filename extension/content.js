const REVIEW_SELECTORS = [
  '[class*="review"]',
  '[class*="Review"]',
  '[class*="comment"]',
  '[class*="Comment"]',
  '[class*="text"]',
  '[class*="Text"]',
  '[data-testid*="review"]',
  '[data-name*="review"]',
  '[id*="review"]',
  '[id*="Review"]',
  'article',
  'li',
]

const CLAIM_KEYWORDS = [
  '아쉬워',
  '별로',
  '불편',
  '파손',
  '깨져',
  '터져',
  '샜',
  '새서',
  '냄새',
  '비린',
  '질겨',
  '딱딱',
  '상했',
  '하자',
  '비싸',
  '작아',
  '곰팡',
  '오염',
  '늦게',
  '누락',
  '교환',
  '재구매 안',
  '환불',
  '반품',
  '실망',
]

const JUNK_PATTERNS = [
  /도움돼요/g,
  /도움이 돼요/g,
  /신고/g,
  /리뷰 더보기/g,
  /판매자 답글/g,
  /더보기/g,
  /접기/g,
]

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'COLLECT_VISIBLE_REVIEWS') return false

  try {
    const result = collectVisibleReviews(Boolean(message.payload?.claimOnly))
    sendResponse({ ok: true, ...result })
  } catch (error) {
    sendResponse({
      ok: false,
      message: error.message || '현재 페이지에서 리뷰를 읽지 못했습니다.',
    })
  }

  return true
})

function collectVisibleReviews(claimOnly) {
  const pageUrl = location.href
  const bodyText = document.body?.innerText || ''
  const selectorNodes = collectSelectorNodes()
  const longDomCandidates = collectLongDomCandidates()
  const bodyTextCandidates = collectBodyTextCandidates(bodyText)
  const seen = new Set()
  const candidates = []

  for (const node of selectorNodes) {
    addCandidate(cleanText(node.innerText || node.textContent || ''))
  }

  for (const row of longDomCandidates) {
    addCandidate(row.text)
  }

  // Fallback: if selector/DOM candidates fail, analyze the visible body text.
  for (const text of bodyTextCandidates) {
    addCandidate(text)
  }

  const filteredReviews = claimOnly
    ? candidates.filter(review => CLAIM_KEYWORDS.some(keyword => review.reviewText.includes(keyword)))
    : candidates

  return {
    url: pageUrl,
    selectorList: REVIEW_SELECTORS,
    candidateDomCount: selectorNodes.size,
    reviewCandidateCount: candidates.length,
    filteredCount: filteredReviews.length,
    bodyTextLength: bodyText.length,
    divCount: document.querySelectorAll('div').length,
    liCount: document.querySelectorAll('li').length,
    articleCount: document.querySelectorAll('article').length,
    pageDebug: {
      title: document.title,
      href: location.href,
      bodyTextLength: bodyText.length,
      bodyTextPreview: bodyText.slice(0, 1000),
      classNames: collectTopClassNames(),
      longDomCandidates: longDomCandidates.slice(0, 20),
    },
    debugHtml: buildDebugHtml(bodyText, longDomCandidates),
    reviews: filteredReviews.slice(0, 100),
  }

  function addCandidate(text) {
    if (!isReviewCandidate(text)) return
    if (seen.has(text)) return

    seen.add(text)
    candidates.push({
      itemName: '',
      vendorName: '',
      productUrl: pageUrl,
      reviewText: text,
      collectedAt: new Date().toISOString(),
      source: 'naver-smartstore',
    })
  }
}

function collectSelectorNodes() {
  const nodes = new Set()

  for (const selector of REVIEW_SELECTORS) {
    for (const element of document.querySelectorAll(selector)) {
      if (isVisible(element)) nodes.add(element)
    }
  }

  return nodes
}

function collectLongDomCandidates() {
  const elements = [...document.querySelectorAll('div, li, article')]
  return elements
    .filter(isVisible)
    .map(element => ({
      tag: element.tagName.toLowerCase(),
      className: normalizeClassName(element.className),
      text: cleanText(element.innerText || element.textContent || ''),
    }))
    .filter(row => row.text.length >= 50 && !isUiLine(row.text))
    .sort((a, b) => scoreText(b.text) - scoreText(a.text))
    .slice(0, 50)
}

function collectBodyTextCandidates(bodyText) {
  const lines = bodyText
    .split(/\n+/)
    .map(cleanText)
    .filter(line => line && !isUiLine(line))

  const chunks = []
  let buffer = []

  for (const line of lines) {
    buffer.push(line)
    const joined = cleanText(buffer.join(' '))

    if (joined.length >= 40) {
      chunks.push(joined)
      buffer = []
    }
  }

  if (buffer.length) {
    const tail = cleanText(buffer.join(' '))
    if (tail.length >= 40) chunks.push(tail)
  }

  return chunks
    .filter(text => text.length >= 40 && text.length <= 1200)
    .sort((a, b) => scoreText(b) - scoreText(a))
    .slice(0, 100)
}

function collectTopClassNames() {
  const counts = new Map()

  for (const element of document.querySelectorAll('*')) {
    const className = normalizeClassName(element.className)
    if (!className) continue

    for (const token of className.split(/\s+/).filter(Boolean)) {
      counts.set(token, (counts.get(token) || 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([name, count]) => `${name} (${count})`)
}

function buildDebugHtml(bodyText, longDomCandidates) {
  return [
    '<!doctype html>',
    '<html lang="ko">',
    '<head><meta charset="utf-8"><title>review debug</title></head>',
    '<body>',
    `<h1>${escapeHtml(document.title || 'review debug')}</h1>`,
    `<p><strong>URL:</strong> ${escapeHtml(location.href)}</p>`,
    `<p><strong>Body text length:</strong> ${bodyText.length}</p>`,
    '<h2>Long DOM Candidates</h2>',
    '<ol>',
    ...longDomCandidates.slice(0, 20).map(row => (
      `<li><strong>${escapeHtml(row.tag)}</strong> ${escapeHtml(row.className)}<pre>${escapeHtml(row.text)}</pre></li>`
    )),
    '</ol>',
    '<h2>Body Text Preview</h2>',
    `<pre>${escapeHtml(bodyText.slice(0, 20000))}</pre>`,
    '</body>',
    '</html>',
  ].join('\n')
}

function scoreText(text) {
  let score = Math.min(text.length, 600)
  if (/리뷰|후기|구매|배송|맛|품질|만족|불편|아쉬|별로|교환|환불/.test(text)) score += 200
  if (/[.!?。]/.test(text)) score += 20
  return score
}

function cleanText(value) {
  let text = String(value || '').replace(/\s+/g, ' ').trim()
  for (const pattern of JUNK_PATTERNS) {
    text = text.replace(pattern, ' ')
  }
  return text.replace(/\s+/g, ' ').trim()
}

function normalizeClassName(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value.baseVal === 'string') return value.baseVal.trim()
  return String(value).trim()
}

function isUiLine(text) {
  return /구매하기|장바구니|상품정보|배송정보|교환\/반품|문의|옵션|가격|혜택|공유|찜하기|카테고리|검색|로그인|회원가입/.test(text)
}

function isReviewCandidate(text) {
  if (text.length < 20) return false
  if (text.length > 1200) return false
  if (isUiLine(text)) return false
  return /[가-힣]/.test(text)
}

function isVisible(element) {
  const rect = element.getBoundingClientRect()
  const style = window.getComputedStyle(element)
  return rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.top < window.innerHeight &&
    style.visibility !== 'hidden' &&
    style.display !== 'none'
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
