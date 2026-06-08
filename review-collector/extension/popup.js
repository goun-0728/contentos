const APP_URL = 'http://localhost:4174'

const elItemName   = document.getElementById('itemName')
const elVendorName = document.getElementById('vendorName')
const elClaimOnly  = document.getElementById('claimOnly')
const elCollect    = document.getElementById('collect')
const elStatus     = document.getElementById('status')

/* ── 저장값 복원 ── */
chrome.storage.local.get(['itemName', 'vendorName', 'claimOnly'], saved => {
  elItemName.value   = saved.itemName   || ''
  elVendorName.value = saved.vendorName || ''
  elClaimOnly.checked = !!saved.claimOnly
})

/* ── 입력값 자동 저장 ── */
;[elItemName, elVendorName].forEach(el => {
  el.addEventListener('input', () => {
    chrome.storage.local.set({ itemName: elItemName.value, vendorName: elVendorName.value })
  })
})
elClaimOnly.addEventListener('change', () => {
  chrome.storage.local.set({ claimOnly: elClaimOnly.checked })
})

/* ── 상태 표시 ── */
function showStatus(msg, type = 'info') {
  elStatus.textContent = msg
  elStatus.className   = type
  elStatus.style.display = 'block'
}

/* ── 수집 버튼 ── */
elCollect.addEventListener('click', async () => {
  const itemName   = elItemName.value.trim()
  const vendorName = elVendorName.value.trim()
  const claimOnly  = elClaimOnly.checked

  if (!itemName)   { showStatus('품목명을 입력해주세요.', 'err'); return }
  if (!vendorName) { showStatus('업체명을 입력해주세요.', 'err'); return }

  /* 현재 탭 확인 */
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.url?.includes('smartstore.naver.com')) {
    showStatus('네이버 스마트스토어 상품 페이지에서 실행해주세요.', 'err')
    return
  }

  elCollect.disabled = true
  showStatus('리뷰 수집 중…', 'info')

  try {
    /* content.js에 수집 요청 */
    let response
    try {
      response = await chrome.tabs.sendMessage(tab.id, { action: 'collect', claimOnly })
    } catch {
      showStatus('페이지를 새로고침 후 다시 시도해주세요.', 'err')
      return
    }

    const reviews = (response?.reviews || []).map(text => ({
      itemName,
      vendorName,
      productUrl: tab.url,
      reviewText: text,
      collectedAt: new Date().toISOString(),
      source: 'naver-smartstore',
    }))

    if (!reviews.length) {
      showStatus(claimOnly ? '클레임 키워드 포함 리뷰가 없습니다.' : '수집된 리뷰가 없습니다. 리뷰 탭이 펼쳐져 있는지 확인해주세요.', 'err')
      return
    }

    /* 로컬 웹앱으로 전송 */
    const res = await fetch(`${APP_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews }),
    })
    if (!res.ok) throw new Error(`서버 오류 (${res.status})`)

    const result = await res.json()
    showStatus(`✓ ${result.saved}건 저장 완료 (중복 ${result.skipped}건 제외)`, 'ok')
  } catch (err) {
    const msg = err.message?.includes('Failed to fetch')
      ? `로컬 웹앱에 연결할 수 없습니다.\n'node review-collector/app/server.mjs'를 실행해주세요.`
      : `오류: ${err.message}`
    showStatus(msg, 'err')
  } finally {
    elCollect.disabled = false
  }
})
