/* 네이버 스마트스토어 리뷰 수집 content script */

const SELECTORS = [
  '[class*="review"]',
  '[class*="Review"]',
  '[class*="comment"]',
  '[class*="text"]',
]

/* 제거할 UI 문구 */
const UI_JUNK = [
  '도움돼요', '도움이 돼요', '신고', '리뷰 더보기', '더보기', '접기',
  '판매자 답글', '리뷰펼치기', '리뷰쓰기', '구매 후기', '포토리뷰',
  '베스트리뷰', '리뷰작성', '평점', '별점', '구매확정',
]

/* 클레임 키워드 */
const CLAIM_KEYWORDS = [
  '아쉽', '별로', '불편', '파손', '깨져', '터져', '샘', '냄새', '비린',
  '짜', '싱겁', '작', '크', '적', '비싸', '늦', '곰팡', '상함',
  '실망', '환불', '교환', '재구매 안',
]

function cleanText(raw) {
  return (raw || '').replace(/\s+/g, ' ').trim()
}

function isJunk(text) {
  if (text.length < 15) return true
  return UI_JUNK.some(j => text === j || text.startsWith(j + ' ') || text.endsWith(' ' + j))
}

function hasClaimKeyword(text) {
  return CLAIM_KEYWORDS.some(k => text.includes(k))
}

function collectReviews(claimOnly) {
  const seen    = new Set()
  const results = []

  for (const selector of SELECTORS) {
    let elements
    try { elements = document.querySelectorAll(selector) } catch { continue }

    for (const el of elements) {
      /* 너무 많은 자식을 가진 컨테이너는 건너뜀 */
      if (el.querySelectorAll('[class*="review"],[class*="Review"]').length > 2) continue

      const text = cleanText(el.innerText || el.textContent)
      if (isJunk(text))      continue
      if (seen.has(text))    continue
      if (claimOnly && !hasClaimKeyword(text)) continue

      seen.add(text)
      results.push(text)
    }

    /* 첫 번째로 결과가 나온 selector에서 중단 */
    if (results.length > 0) break
  }

  return results
}

/* ── 메시지 리스너 ── */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action !== 'collect') return

  try {
    const reviews = collectReviews(!!message.claimOnly)
    sendResponse({ reviews })
  } catch (err) {
    sendResponse({ reviews: [], error: err.message })
  }

  return true /* 비동기 응답 채널 유지 */
})
