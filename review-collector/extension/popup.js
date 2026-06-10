const APP_URL = 'http://localhost:4174'
const STORAGE_KEY = 'reviewCollectorLegacyPopupSettings'

const hasChromeStorage =
  typeof chrome !== 'undefined' &&
  chrome.storage &&
  chrome.storage.local

let memorySettings = {}

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
      // Keep the in-memory fallback above.
    }
    return
  }

  return new Promise(resolve => {
    chrome.storage.local.set({ [STORAGE_KEY]: settings }, resolve)
  })
}

const elItemName = document.getElementById('itemName')
const elVendorName = document.getElementById('vendorName')
const elClaimOnly = document.getElementById('claimOnly')
const elCollect = document.getElementById('collect')
const elStatus = document.getElementById('status')

init()

async function init() {
  const saved = await loadSettings()
  elItemName.value = saved.itemName || ''
  elVendorName.value = saved.vendorName || ''
  elClaimOnly.checked = saved.claimOnly !== false

  ;[elItemName, elVendorName].forEach(el => {
    el.addEventListener('input', () => {
      saveSettings(readSettings())
    })
  })

  elClaimOnly.addEventListener('change', () => {
    saveSettings(readSettings())
  })

  elCollect.addEventListener('click', collectAndSend)
}

function readSettings() {
  return {
    itemName: elItemName.value.trim(),
    vendorName: elVendorName.value.trim(),
    claimOnly: elClaimOnly.checked,
  }
}

function showStatus(message, type = 'info') {
  elStatus.textContent = message
  elStatus.className = type
  elStatus.style.display = 'block'
}

async function collectAndSend() {
  const settings = readSettings()
  await saveSettings(settings)

  if (!settings.itemName) {
    showStatus('품목명을 입력해주세요.', 'err')
    return
  }
  if (!settings.vendorName) {
    showStatus('업체명을 입력해주세요.', 'err')
    return
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.url?.includes('smartstore.naver.com') && !tab?.url?.includes('brand.naver.com')) {
    showStatus('네이버 스마트스토어 또는 브랜드스토어 페이지에서 실행해주세요.', 'err')
    return
  }

  elCollect.disabled = true
  showStatus('리뷰 수집 중...', 'info')

  try {
    let response
    try {
      response = await chrome.tabs.sendMessage(tab.id, {
        action: 'collect',
        claimOnly: settings.claimOnly,
      })
    } catch {
      showStatus('페이지를 새로고침한 뒤 다시 시도해주세요.', 'err')
      return
    }

    const reviews = (response?.reviews || []).map(text => ({
      itemName: settings.itemName,
      vendorName: settings.vendorName,
      productUrl: tab.url,
      reviewText: text,
      collectedAt: new Date().toISOString(),
      source: 'naver-smartstore',
    }))

    if (!reviews.length) {
      showStatus(
        settings.claimOnly
          ? '클레임 키워드 포함 리뷰가 없습니다.'
          : '수집된 리뷰가 없습니다. 리뷰 탭이 펼쳐져 있는지 확인해주세요.',
        'err'
      )
      return
    }

    const res = await fetch(`${APP_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews }),
    })
    if (!res.ok) throw new Error(`서버 오류 (${res.status})`)

    const result = await res.json()
    showStatus(`저장 완료: ${result.saved ?? result.accepted ?? reviews.length}건`, 'ok')
  } catch (error) {
    const message = error.message?.includes('Failed to fetch')
      ? "로컬 웹앱에 연결할 수 없습니다.\n'node review-collector/app/server.mjs'를 실행해주세요."
      : `오류: ${error.message}`
    showStatus(message, 'err')
  } finally {
    elCollect.disabled = false
  }
}
