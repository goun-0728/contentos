// src/utils.js
import { mkSec, AUTO_DS, AUTO_TPL } from './constants'

// ── 텍스트 파서 ─────────────────────────────────────
export function parseBlocks(text) {
  const bs = []; let c = null
  text.split('\n').forEach(l => {
    if (l.startsWith('▼ ')) { if (c) bs.push(c); c = { title: l.slice(2).trim(), lines: [] } }
    else if (c) c.lines.push(l)
  })
  if (c) bs.push(c)
  return bs
}

export function parseSections(text) {
  const re = /\[SECTION\s*(\d+)\s*[-–]\s*([^\]]+)\]([\s\S]*?)(?=\[SECTION\s*\d+|\n▼|$)/g
  const out = []; let m
  while ((m = re.exec(text)) !== null) {
    const r = m[3]
    const gf = k => {
      const rx = new RegExp(k + ':\\s*([^\\n]+)')
      const f = r.match(rx); if (!f) return ''
      // annotation 힌트 제거: (15자 이내), (1줄) 등
      return f[1].replace(/^\([^)]+\)\s*/, '').replace(/\s*\([^)]+\)$/, '').trim()
    }
    const gb = k => {
      const rx = new RegExp(k + ':\\s*\\n([\\s\\S]*?)(?=\\n[가-힣A-Za-z]+:|\\n\\[|▼|$)')
      const f = r.match(rx); if (!f) return []
      return f[1].split('\n').map(l => l.replace(/^[\s•\-\d\.]+/, '').trim()).filter(l => l.length > 1)
    }
    const gs = k => {
      const rx = new RegExp(k + ':\\s*\\n([\\s\\S]*?)(?=\\n[가-힣A-Za-z]+:|\\n\\[|▼|$)')
      const f = r.match(rx); if (!f) return {}
      const o = {}; const sr = /-\s*([^:\n]+):\s*(.+)/g; let s
      while ((s = sr.exec(f[1])) !== null) o[s[1].trim()] = s[2].trim()
      return o
    }
    const sn = m[2].trim()
    out.push(mkSec({
      sectionType: sn, title: sn,
      mainCopy: gf('메인카피'), subCopy: gf('서브카피'),
      description: gf('내용'),
      points: gb('포인트'), cta: gf('버튼문구'),
      designStyle: AUTO_DS[sn] || '크림',
      template: AUTO_TPL[sn] || 'material',
      photoDir: JSON.stringify(gs('촬영기획')),
      imagePrompt: gf('AI프롬프트'),
      secImg: null,
    }))
  }
  return out
}

// ── 이미지 유틸 ─────────────────────────────────────
export function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onload = ev => res(ev.target.result)
    fr.onerror = rej
    fr.readAsDataURL(file)
  })
}

export function downloadURL(url, name) {
  const a = document.createElement('a')
  a.href = url; a.download = name; a.click()
}

// ── html2canvas PNG 저장 ────────────────────────────
export async function capturePNG(el, filename, opts = {}) {
  if (document.fonts?.ready) {
    try { await document.fonts.ready } catch {}
  }
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

  const h2c = await new Promise((res, rej) => {
    if (window.html2canvas) { res(window.html2canvas); return }
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
    s.onload = () => res(window.html2canvas)
    s.onerror = rej
    document.head.appendChild(s)
  })

  // el(data-sect-card) 부모는 transform:scale 래퍼, 그 위가 wrapRef
  // 캡처 전 transform을 제거해야 html2canvas가 실제 캔버스 폭 기준으로 렌더링됨
  const scaler  = el.parentElement
  const wrap    = scaler?.parentElement
  const prevTx  = scaler?.style.transform || ''
  const prevH   = wrap?.style.height     || ''
  const prevOv  = wrap?.style.overflow   || ''

  if (prevTx) {
    scaler.style.transform = 'none'
    if (wrap) {
      wrap.style.height   = el.offsetHeight + 'px'
      wrap.style.overflow = 'visible'
    }
    // 브라우저가 레이아웃을 재계산하도록 한 프레임 대기
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  }

  const exportW = Number(el.dataset?.canvasWidth) || el.offsetWidth
  const exportH = Number(el.dataset?.canvasHeight) || el.offsetHeight
  let canvas
  try {
    canvas = await h2c(el, {
      scale: opts.scale || 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      windowWidth: exportW,
      width:  exportW,
      height: exportH,
      ...opts,
    })
  } finally {
    // 캡처 성공/실패 무관하게 DOM 복원
    if (prevTx) {
      scaler.style.transform = prevTx
      if (wrap) {
        wrap.style.height   = prevH
        wrap.style.overflow = prevOv
      }
    }
  }

  downloadURL(canvas.toDataURL('image/png'), filename)
}
