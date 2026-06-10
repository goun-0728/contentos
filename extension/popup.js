const DEFAULT_TARGET_URL = 'https://your-project.vercel.app/review-collector'
const STORAGE_KEY = 'reviewCollectorPopupSettings'

const hasChromeStorage =
  typeof chrome !== 'undefined' &&
  chrome.storage &&
  chrome.storage.local

let memorySettings = {}
let pendingReviews = []
let pendingDebugHtml = ''
let lastDebug = createEmptyDebug()

const els = {
  targetUrl: document.querySelector('#targetUrl'),
  itemName: document.querySelector('#itemName'),
  vendorName: document.querySelector('#vendorName'),
  claimOnly: document.querySelector('#claimOnly'),
  collect: document.querySelector('#collect'),
  openTarget: document.querySelector('#openTarget'),
  downloadJson: document.querySelector('#downloadJson'),
  sendLocal: document.querySelector('#sendLocal'),
  saveDebug: document.querySelector('#saveDebug'),
  status: document.querySelector('#status'),
  debugLog: document.querySelector('#debugLog'),
  preview: document.querySelector('#preview'),
}

init()

async function init() {
  const saved = await loadSettings()
  els.targetUrl.value = saved.targetUrl || DEFAULT_TARGET_URL
  els.itemName.value = saved.itemName || ''
  els.vendorName.value = saved.vendorName || ''
  els.claimOnly.checked = saved.claimOnly !== false

  els.collect.addEventListener('click', collectReviews)
  els.openTarget.addEventListener('click', openTargetWithReviews)
  els.downloadJson.addEventListener('click', downloadReviewsJson)
  els.sendLocal.addEventListener('click', sendToLocalApi)
  els.saveDebug.addEventListener('click', downloadDebugHtml)
}

async function loadSettings() {
  if (!hasChromeStorage) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : memorySettings
    } catch {
      return memorySettings
    }
  }

  return new Promise(resolve => {
    chrome.storage.local.get(STORAGE_KEY, data => {
      resolve(data?.[STORAGE_KEY] || {})
    })
  })
}

async function saveSettings(settings) {
  memorySettings = { ...settings }

  if (!hasChromeStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // Memory fallback already updated.
    }
    return
  }

  return new Promise(resolve => {
    chrome.storage.local.set({ [STORAGE_KEY]: settings }, resolve)
  })
}

async function collectReviews() {
  const settings = readSettings()
  await saveSettings(settings)

  pendingReviews = []
  pendingDebugHtml = ''
  lastDebug = createEmptyDebug()
  renderDebug()
  renderPreview()
  setResultActionsEnabled(false)
  setDebugEnabled(false)
  setLoading(true, '현재 탭에서 보이는 리뷰를 읽는 중입니다.')

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) throw new Error('활성 탭을 찾지 못했습니다.')
    if (!isNaverStoreUrl(tab.url || '')) {
      throw new Error('네이버 스마트스토어 또는 브랜드스토어 페이지에서 실행해주세요.')
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'COLLECT_VISIBLE_REVIEWS',
      payload: settings,
    })

    if (!response?.ok) {
      throw new Error(response?.message || '리뷰 수집에 실패했습니다.')
    }

    pendingReviews = response.reviews.map(review => ({
      ...review,
      itemName: settings.itemName,
      vendorName: settings.vendorName,
    }))
    pendingDebugHtml = response.debugHtml || ''

    lastDebug = {
      currentUrl: response.url || tab.url || '-',
      selectorList: response.selectorList || [],
      candidateDomCount: response.candidateDomCount ?? 0,
      reviewCandidateCount: response.reviewCandidateCount ?? 0,
      filteredCount: response.filteredCount ?? pendingReviews.length,
      bodyTextLength: response.bodyTextLength ?? 0,
      divCount: response.divCount ?? 0,
      liCount: response.liCount ?? 0,
      articleCount: response.articleCount ?? 0,
      pageDebug: response.pageDebug || {},
      transferStatus: '미전송',
    }

    renderDebug()
    renderPreview()
    setResultActionsEnabled(pendingReviews.length > 0)
    setDebugEnabled(Boolean(pendingDebugHtml))
    setStatus(
      pendingReviews.length
        ? `발견 리뷰 수: ${pendingReviews.length}건\nVercel 웹앱으로 열어 전달하거나 JSON을 다운로드하세요.`
        : '전송할 리뷰가 없습니다. 디버그 로그의 body text와 DOM 후보를 확인하세요.'
    )
  } catch (error) {
    lastDebug.transferStatus = '실패'
    renderDebug()
    setStatus(`수집 실패: ${error.message || '알 수 없는 문제가 발생했습니다.'}`)
  } finally {
    setLoading(false)
  }
}

async function openTargetWithReviews() {
  if (!pendingReviews.length) {
    setStatus('먼저 리뷰를 수집해주세요.')
    return
  }

  const settings = readSettings()
  await saveSettings(settings)

  const url = buildImportUrl(settings.targetUrl, pendingReviews)
  chrome.tabs.create({ url })
  lastDebug.transferStatus = '웹앱 열기'
  renderDebug()
  setStatus('전송 대상 웹앱을 열었습니다. 열린 페이지의 localStorage에 리뷰가 저장됩니다.')
}

async function sendToLocalApi() {
  if (!pendingReviews.length) {
    setStatus('먼저 리뷰를 수집해주세요.')
    return
  }

  const settings = readSettings()
  await saveSettings(settings)

  const endpoint = buildLocalApiEndpoint(settings.targetUrl)
  setLoading(true, `${endpoint} 로 전송하는 중입니다.`)

  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews: pendingReviews }),
    })
    const payload = await result.json()
    if (!payload.ok) throw new Error(payload.message || 'API 전송에 실패했습니다.')

    lastDebug.transferStatus = '성공'
    renderDebug()
    setStatus(`localhost API 전송 성공: ${payload.accepted}건`)
  } catch (error) {
    lastDebug.transferStatus = '실패'
    renderDebug()
    setStatus(`localhost API 전송 실패: ${error.message || '로컬 앱 연결을 확인해주세요.'}`)
  } finally {
    setLoading(false)
  }
}

function downloadReviewsJson() {
  if (!pendingReviews.length) {
    setStatus('먼저 리뷰를 수집해주세요.')
    return
  }

  downloadFile(`review-claims-${dateStamp()}.json`, JSON.stringify({ reviews: pendingReviews }, null, 2), 'application/json;charset=utf-8')
  setStatus('JSON 파일을 다운로드했습니다. Vercel 웹앱에서 업로드할 수 있습니다.')
}

function downloadDebugHtml() {
  if (!pendingDebugHtml) {
    setStatus('저장할 디버그 HTML이 없습니다. 먼저 리뷰 수집을 실행해주세요.')
    return
  }

  downloadFile('review-debug.html', pendingDebugHtml, 'text/html;charset=utf-8')
  setStatus('review-debug.html 파일을 다운로드했습니다.')
}

function buildImportUrl(targetUrl, reviews) {
  const url = normalizeTargetUrl(targetUrl)
  const separator = url.includes('#') ? '&' : '#'
  return `${url}${separator}reviews=${encodeURIComponent(JSON.stringify(reviews))}`
}

function buildLocalApiEndpoint(targetUrl) {
  const url = new URL(normalizeTargetUrl(targetUrl))
  return `${url.origin}/api/reviews`
}

function normalizeTargetUrl(value) {
  const raw = String(value || '').trim() || DEFAULT_TARGET_URL
  const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`
  const url = new URL(withProtocol)

  if (url.hostname.endsWith('vercel.app') && !url.pathname.includes('review-collector')) {
    url.pathname = '/review-collector'
  }

  return url.toString()
}

function createEmptyDebug() {
  return {
    currentUrl: '-',
    selectorList: [],
    candidateDomCount: 0,
    reviewCandidateCount: 0,
    filteredCount: 0,
    bodyTextLength: 0,
    divCount: 0,
    liCount: 0,
    articleCount: 0,
    pageDebug: {},
    transferStatus: '미전송',
  }
}

function readSettings() {
  return {
    targetUrl: els.targetUrl.value.trim() || DEFAULT_TARGET_URL,
    itemName: els.itemName.value.trim(),
    vendorName: els.vendorName.value.trim(),
    claimOnly: els.claimOnly.checked,
  }
}

function isNaverStoreUrl(url) {
  return /^https:\/\/(smartstore|brand)\.naver\.com\//.test(url)
}

function renderDebug() {
  const pageDebug = lastDebug.pageDebug || {}
  const longDomText = (pageDebug.longDomCandidates || [])
    .slice(0, 20)
    .map((row, index) => `[${index + 1}] <${row.tag}> ${row.className || '-'}\n${row.text}`)
    .join('\n\n')

  els.debugLog.style.display = 'block'
  els.debugLog.textContent = [
    '현재 URL:',
    lastDebug.currentUrl,
    '',
    'document.title:',
    pageDebug.title || '-',
    '',
    '현재 selector 목록:',
    ...(lastDebug.selectorList.length ? lastDebug.selectorList : ['-']),
    '',
    '후보 DOM 수:',
    String(lastDebug.candidateDomCount),
    '',
    '리뷰 후보 수:',
    String(lastDebug.reviewCandidateCount),
    '',
    '클레임 필터 후:',
    String(lastDebug.filteredCount),
    '',
    'body text 길이:',
    String(lastDebug.bodyTextLength),
    '',
    '발견된 div/li/article 개수:',
    `${lastDebug.divCount} / ${lastDebug.liCount} / ${lastDebug.articleCount}`,
    '',
    'body text 앞 1000자:',
    pageDebug.bodyTextPreview || '-',
    '',
    'class 목록 상위 100개:',
    ...((pageDebug.classNames || []).length ? pageDebug.classNames : ['-']),
    '',
    '리뷰 영역 추정 DOM 후보 상위 20개:',
    longDomText || '-',
    '',
    '전송 성공 여부:',
    lastDebug.transferStatus,
  ].join('\n')
}

function renderPreview() {
  if (!pendingReviews.length) {
    els.preview.style.display = 'none'
    els.preview.innerHTML = ''
    return
  }

  const items = pendingReviews.slice(0, 10).map((review, index) => `
    <div class="preview-item">
      <strong>[리뷰${index + 1}]</strong>
      ${escapeHtml(review.reviewText)}
    </div>
  `).join('')

  els.preview.style.display = 'block'
  els.preview.innerHTML = `<h2>리뷰 후보 10개 미리보기</h2>${items}`
}

function setLoading(isLoading, message) {
  els.collect.disabled = isLoading
  if (message) setStatus(message)
}

function setResultActionsEnabled(isEnabled) {
  els.openTarget.disabled = !isEnabled
  els.downloadJson.disabled = !isEnabled
  els.sendLocal.disabled = !isEnabled
}

function setDebugEnabled(isEnabled) {
  els.saveDebug.disabled = !isEnabled
}

function setStatus(message) {
  els.status.textContent = message
}

function dateStamp() {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
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
