// src/components/SectionTemplates.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react'

const CARD_W = 970

const SAMPLE_IMGS = [
  'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
  'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
]

export const FONT_OPTS = [
  { l: '나눔고딕', v: "'Nanum Gothic', sans-serif" },
  { l: '나눔명조', v: "'Nanum Myeongjo', serif" },
  { l: '고딕A1',   v: "'Gothic A1', sans-serif" },
  { l: '도현',     v: "'Do Hyeon', sans-serif" },
  { l: '제주고딕', v: "'Jeju Gothic', sans-serif" },
  { l: '검은고딕', v: "'Black Han Sans', sans-serif" },
]

export const SHAPE_DEFS = [
  { k: 'circle',   l: '원형' },
  { k: 'square',   l: '네모' },
  { k: 'triangle', l: '삼각형' },
  { k: 'pentagon', l: '오각형' },
  { k: 'hexagon',  l: '육각형' },
]

function shapeCSS(k) {
  if (k === 'square')   return { borderRadius: 10 }
  if (k === 'triangle') return { borderRadius: 0, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }
  if (k === 'pentagon') return { borderRadius: 0, clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }
  if (k === 'hexagon')  return { borderRadius: 0, clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }
  return { borderRadius: '50%' }
}

export function mkGrad(dir, alpha) {
  const a = (alpha ?? 70) / 100
  if (!dir || dir === 'none') return null
  if (dir === 'bottom') return `linear-gradient(to top, rgba(0,0,0,${a}) 0%, transparent 60%)`
  if (dir === 'top')    return `linear-gradient(to bottom, rgba(0,0,0,${a}) 0%, transparent 60%)`
  if (dir === 'full')   return `rgba(0,0,0,${(a * 0.55).toFixed(2)})`
  return null
}

const ROMAN = ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ']

/* ── ImageAdjust: 이미지 드래그+휠 조작 ── */
export function ImageAdjust({ url, editing, imgMeta, onMetaChange, fixedH, fitMode = 'cover' }) {
  const [dragging, setDragging] = useState(false)
  const [start, setStart]       = useState({ x: 0, y: 0 })
  const meta    = imgMeta || { scale: 1, x: 0, y: 0 }
  const divRef  = useRef(null)
  const snapRef = useRef(null)
  snapRef.current = { editing, meta, onMetaChange }

  const handleMouseDown = e => {
    if (!editing) return
    setDragging(true)
    setStart({ x: e.clientX - meta.x, y: e.clientY - meta.y })
    e.preventDefault()
  }
  const handleMouseMove = e => { if (!dragging) return; onMetaChange({ ...meta, x: e.clientX - start.x, y: e.clientY - start.y }) }
  const handleMouseUp   = () => setDragging(false)

  useEffect(() => {
    const el = divRef.current; if (!el) return
    const handler = e => {
      const { editing, meta, onMetaChange } = snapRef.current
      if (!editing) return
      e.preventDefault()
      onMetaChange({ ...meta, scale: Math.max(0.5, Math.min(4, meta.scale + (e.deltaY > 0 ? -0.05 : 0.05))) })
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  return (
    <div ref={divRef} style={{ position: 'relative', overflow: 'hidden', ...(fixedH ? { height: fixedH } : {}) }}
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <img src={url} alt="" draggable={false}
        style={{ width: '100%', height: fixedH ? '100%' : 'auto', display: 'block', userSelect: 'none',
          objectFit: fixedH ? fitMode : 'initial',
          transform: `scale(${meta.scale}) translate(${meta.x / meta.scale}px, ${meta.y / meta.scale}px)`,
          transformOrigin: 'center center',
          cursor: editing ? (dragging ? 'grabbing' : 'grab') : 'default',
          transition: dragging ? 'none' : 'transform 0.1s' }}
        onMouseDown={handleMouseDown} />
    </div>
  )
}

/* ── ImgBox: 이미지 슬롯 (업로드 + ImageAdjust 통합) ── */
export function ImgBox({ url, t, editing, onImgChange, minH = 320, imgMeta, onMetaChange, fixedH, fitMode }) {
  const ref = useRef(null)
  const sampleRef = useRef(SAMPLE_IMGS[Math.floor(Math.random() * SAMPLE_IMGS.length)])
  const handleFile = e => {
    const f = e.target.files[0]; if (!f || !onImgChange) return
    const fr = new FileReader()
    fr.onload = ev => onImgChange(ev.target.result)
    fr.readAsDataURL(f); e.target.value = ''
  }
  if (!url) return null
  if (url === 'slot') return (
    <div style={{ position: 'relative', ...(fixedH ? { height: fixedH } : { aspectRatio: '3/4' }), overflow: 'hidden' }}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <img
        src={sampleRef.current}
        alt=""
        crossOrigin="anonymous"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.08)' }}>
        <div style={{ position: 'absolute', top: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', padding: '0 16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.97)', padding: '12px 24px', borderRadius: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.18)', textAlign: 'center', maxWidth: 340 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 4 }}>Replace with real product photo</div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>Upload the client's product image for final delivery.</div>
          </div>
        </div>
        <div onClick={e => { e.stopPropagation(); ref.current?.click() }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            cursor: 'pointer', background: 'rgba(255,255,255,0.9)', padding: '20px 32px',
            borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}>
          <span style={{ fontSize: 36 }}>📷</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Replace product photo</span>
        </div>
      </div>
    </div>
  )
  return (
    <div style={{ position: 'relative' }}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      {editing && (
        <button onClick={e => { e.stopPropagation(); ref.current?.click() }}
          style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, padding: '8px 18px', fontSize: 13, fontWeight: 700, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          📷 Replace
        </button>
      )}
      <ImageAdjust url={url} editing={editing} imgMeta={imgMeta} onMetaChange={onMetaChange || (() => {})} fixedH={fixedH} fitMode={fitMode} />
      {editing && <div style={{ position: 'absolute', inset: 0, border: `2px dashed ${t?.bd || '#ccc'}`, pointerEvents: 'none', zIndex: 5 }} />}
    </div>
  )
}

/* ── 텍스트 스타일 읽기 helper ── */
function getTS(s, field, def = {}) {
  const stored = s.textStyles?.[field] || {}
  return {
    fontSize:      stored.fontSize      ?? def.fontSize      ?? 18,
    color:         stored.color         ?? def.color         ?? '#111',
    fontFamily:    stored.fontFamily    ?? def.fontFamily    ?? "'Nanum Gothic', sans-serif",
    fontWeight:    stored.bold ? 700 : (def.fontWeight ?? 400),
    lineHeight:    def.lineHeight    || 1.6,
    letterSpacing: def.letterSpacing || 'normal',
    wordBreak: 'keep-all',
    whiteSpace: 'pre-wrap',
  }
}

/* ── ET: 클릭하면 인라인 편집 + placeholder + 모서리 리사이즈 핸들 ── */
function ET({ s, field, editing, onChange, onFocus, def = {}, style: extra = {}, placeholder = '' }) {
  const st  = { ...getTS(s, field, def), ...extra }
  const val = s[field] || ''
  const [hovered,  setHovered]  = useState(false)
  const [resizing, setResizing] = useState(false)
  const [focused,  setFocused]  = useState(false)
  const rsRef = useRef(null)

  useEffect(() => {
    if (!resizing) return
    const onMove = e => {
      const { startX, startY, startSize, snapStyles, corner } = rsRef.current
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      const delta = corner === 'se' ? (dx + dy) / 4 : corner === 'nw' ? (-dx - dy) / 4 : corner === 'ne' ? (dx - dy) / 4 : (-dx + dy) / 4
      const newSize = Math.max(10, Math.min(120, Math.round(startSize + delta)))
      onChange('textStyles', { ...snapStyles, [field]: { ...(snapStyles[field] || {}), fontSize: newSize } })
    }
    const onUp = () => setResizing(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [resizing]) // eslint-disable-line

  if (!editing) {
    const display = val || placeholder
    if (!display) return null
    return <div style={{ ...st, opacity: val ? 1 : 0.35 }}>{display}</div>
  }
  const showPH = !!placeholder && !val && !focused
  return (
    <div
      style={{ position: 'relative', display: extra.display || 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {showPH && (
        <div style={{ ...st, display: undefined, opacity: 0.32, position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none', zIndex: 1 }}>
          {placeholder}
        </div>
      )}
      <div contentEditable suppressContentEditableWarning
        onFocus={e => { setFocused(true); onFocus?.(field) }}
        onBlur={e => { setFocused(false); onChange(field, e.currentTarget.innerText) }}
        style={{ ...st, display: undefined, outline: 'none', borderBottom: '1.5px dashed rgba(59,130,246,0.55)', minHeight: 20, cursor: 'text', position: 'relative', zIndex: 2 }}
        dangerouslySetInnerHTML={{ __html: val }}
      />
      {(hovered || resizing) && [
        ['nw', { top: -5, left: -5 }, 'nw-resize'],
        ['ne', { top: -5, right: -5 }, 'ne-resize'],
        ['sw', { bottom: -5, left: -5 }, 'sw-resize'],
        ['se', { bottom: -5, right: -5 }, 'se-resize'],
      ].map(([corner, pos, cur]) => (
        <div key={corner}
          style={{ position:'absolute', ...pos, width:10, height:10, borderRadius:2, background:'#3b82f6', cursor:cur, zIndex:30, border:'1.5px solid #fff', boxShadow:'0 1px 4px rgba(0,0,0,0.25)' }}
          onMouseDown={e => {
            e.preventDefault(); e.stopPropagation()
            rsRef.current = { startX: e.clientX, startY: e.clientY, startSize: st.fontSize, snapStyles: s.textStyles || {}, corner }
            setResizing(true)
          }}
        />
      ))}
    </div>
  )
}

/* ── DragET: 이미지 위 절대좌표 드래그 가능 텍스트 ── */
function DragET({ s, field, editing, onChange, onFocus, def = {}, placeholder = '' }) {
  const stored  = s.textStyles?.[field] || {}
  const xp      = stored.x ?? def.x ?? 6
  const yp      = stored.y ?? def.y ?? 60
  const st      = getTS(s, field, def)
  const val     = s[field] || ''
  const dragRef = useRef(null)
  const [dragging,  setDragging]  = useState(false)
  const [hdHovered, setHdHovered] = useState(false)
  const [resizing,  setResizing]  = useState(false)
  const startRef = useRef(null)
  const rsRef    = useRef(null)

  useEffect(() => {
    if (!resizing) return
    const onMove = e => {
      const { startX, startY, startSize, snapStyles, corner } = rsRef.current
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      const delta = corner === 'se' ? (dx + dy) / 4 : corner === 'nw' ? (-dx - dy) / 4 : corner === 'ne' ? (dx - dy) / 4 : (-dx + dy) / 4
      const newSize = Math.max(10, Math.min(120, Math.round(startSize + delta)))
      onChange('textStyles', { ...snapStyles, [field]: { ...(snapStyles[field] || {}), fontSize: newSize } })
    }
    const onUp = () => setResizing(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [resizing]) // eslint-disable-line

  const setPos = useCallback((x, y) => {
    onChange('textStyles', {
      ...(s.textStyles || {}),
      [field]: { ...(s.textStyles?.[field] || {}), x: Math.max(0, Math.min(88, x)), y: Math.max(0, Math.min(92, y)) }
    })
  }, [s.textStyles, field, onChange])

  useEffect(() => {
    if (!dragging) return
    const onMove = e => {
      const container = dragRef.current?.parentElement
      if (!container || !startRef.current) return
      const rect = container.getBoundingClientRect()
      const { mx, my, ox, oy } = startRef.current
      setPos(ox + (e.clientX - mx) / rect.width * 100, oy + (e.clientY - my) / rect.height * 100)
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, setPos])

  const onMD = e => {
    if (!editing || e.target.getAttribute('contenteditable') === 'true') return
    startRef.current = { mx: e.clientX, my: e.clientY, ox: xp, oy: yp }
    setDragging(true)
    e.preventDefault()
  }

  return (
    <div ref={dragRef}
      style={{ position: 'absolute', left: `${xp}%`, top: `${yp}%`, zIndex: 5, maxWidth: '82%',
        cursor: editing ? (dragging ? 'grabbing' : 'grab') : 'default',
        padding: editing ? '4px 8px' : 0,
        outline: editing ? '1px dashed rgba(255,255,255,0.45)' : 'none' }}
      onMouseDown={onMD}
      onClick={() => editing && onFocus?.(field)}
      onMouseEnter={() => setHdHovered(true)}
      onMouseLeave={() => setHdHovered(false)}
    >
      {editing
        ? <>
            {!val && !!placeholder && (
              <div style={{ ...st, opacity: 0.38, pointerEvents: 'none', textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>{placeholder}</div>
            )}
            <div contentEditable suppressContentEditableWarning
              onFocus={() => onFocus?.(field)}
              onBlur={e => onChange(field, e.currentTarget.innerText)}
              style={{ ...st, outline: 'none', cursor: 'text', textShadow: '0 2px 14px rgba(0,0,0,0.9)', position: 'relative' }}
              dangerouslySetInnerHTML={{ __html: val }}
            />
          </>
        : <div style={{ ...st, textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>{val}</div>
      }
      {editing && (hdHovered || resizing) && [
        ['nw', { top: -5, left: -5 }, 'nw-resize'],
        ['ne', { top: -5, right: -5 }, 'ne-resize'],
        ['sw', { bottom: -5, left: -5 }, 'sw-resize'],
        ['se', { bottom: -5, right: -5 }, 'se-resize'],
      ].map(([corner, pos, cur]) => (
        <div key={corner}
          style={{ position:'absolute', ...pos, width:10, height:10, borderRadius:2, background:'#3b82f6', cursor:cur, zIndex:30, border:'1.5px solid #fff', boxShadow:'0 1px 4px rgba(0,0,0,0.25)' }}
          onMouseDown={e => {
            e.preventDefault(); e.stopPropagation()
            rsRef.current = { startX: e.clientX, startY: e.clientY, startSize: st.fontSize, snapStyles: s.textStyles || {}, corner }
            setResizing(true)
          }}
        />
      ))}
    </div>
  )
}

/* ── PointInput: 포인트 항목 textarea ── */
function PointInput({ value, onChange, onFocus }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      onFocus={onFocus}
      rows={Math.max(2, (value || '').split('\n').length)}
      style={{ flex: 1, fontSize: 14, border: '1px solid #3b82f6', borderRadius: 6, padding: '7px 10px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, width: '100%' }}
    />
  )
}

const delBtnInline   = { width: 26, height: 26, borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontSize: 14, cursor: 'pointer', flexShrink: 0, fontWeight: 700, lineHeight: 1 }
const delBtnAbsolute = { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontWeight: 700, lineHeight: 1, zIndex: 2 }
const addBtnStyle    = { padding: '12px 32px', fontSize: 13, fontWeight: 600, border: '1.5px dashed #bbb', borderRadius: 8, background: 'transparent', color: '#888', cursor: 'pointer' }

/* ══════════════════════════════════════════════════
   1. 풀이미지형 (fullHero)
   전체 배경이미지 + 하단 그라데이션
   상단 서브카피 / 중앙 메인타이틀 / 하단 포인트 3개 가로배치
══════════════════════════════════════════════════ */
export function TplFullHero({ s, img, t, editing, onChange, secMeta, onSecMeta, onFieldFocus }) {
  const imgNode = img || (editing ? 'slot' : null)
  const pts = s.points || []
  const displayPts = editing ? (pts.length ? pts : ['', '', '']) : pts.slice(0, 3).filter(p => p && p.trim())

  return (
    <div style={{ width: CARD_W, background: '#000', overflow: 'hidden' }}>
      <div style={{ position: 'relative', height: 1529 }}>
        {imgNode
          ? <ImgBox url={imgNode} t={t} editing={editing} onImgChange={v => onChange('secImg', v)}
              imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} fixedH={1529} fitMode="cover" />
          : <div style={{ height: 1529, background: `linear-gradient(160deg, ${t.ac}44 0%, ${t.bg} 100%)` }} />
        }
        {/* 전체 그라데이션 오버레이 */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.85) 78%, rgba(0,0,0,0.96) 100%)' }} />

        {/* 드래그 텍스트: 서브카피 (상단) */}
        <DragET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
          def={{ x: 6, y: 5, fontSize: 22, color: 'rgba(255,255,255,0.82)', lineHeight: 1.5, letterSpacing: '0.05em' }}
          placeholder="서브 카피" />

        {/* 드래그 텍스트: 메인카피 (중앙 하단) */}
        <DragET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
          def={{ x: 6, y: 52, fontSize: 66, color: '#fff', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' }}
          placeholder="메인 타이틀" />

        {/* 하단 포인트 바 */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '20px 40px 36px', display: 'flex',
          borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          {[0, 1, 2].map(i => {
            const p = displayPts[i]
            return (
              <div key={i} style={{ flex: 1, textAlign: 'center', padding: '0 16px',
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.ac,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{ROMAN[i]}</span>
                </div>
                {editing
                  ? <PointInput value={p ?? ''} onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }} onFocus={() => onFieldFocus?.('points')} />
                  : p ? <div style={{ fontSize: s.textStyles?.['points']?.fontSize ?? 15, fontFamily: s.textStyles?.['points']?.fontFamily || 'inherit', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, fontWeight: 600, wordBreak: 'keep-all' }}>{p}</div> : null
                }
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   2. 상하분할형 (topBottom)
   상단 60% 제품이미지 / 하단 40% 배경색+제목/서브/내용
══════════════════════════════════════════════════ */
export function TplTopBottom({ s, img, t, editing, onChange, secMeta, onSecMeta, onFieldFocus }) {
  const imgNode = img || (editing ? 'slot' : null)
  return (
    <div style={{ width: CARD_W, background: t.bg }}>
      {/* 상단: 이미지 60% */}
      <div>
        {imgNode
          ? <ImgBox url={imgNode} t={t} editing={editing} onImgChange={v => onChange('secImg', v)}
              imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} fixedH={920} fitMode="cover" />
          : <div style={{ height: 920, background: `linear-gradient(135deg, ${t.ac}44 0%, ${t.sub} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 64, opacity: 0.15 }}>📷</span>
            </div>
        }
      </div>
      {/* 하단: 텍스트 40% */}
      <div style={{ background: t.bg, padding: '64px 80px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 520 }}>
        <div style={{ marginBottom: 22 }}>
          <ET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 54, color: t.fg, fontWeight: 900, lineHeight: 1.18, letterSpacing: '-0.028em' }}
            placeholder="메인 제목" />
        </div>
        {(s.subCopy || editing) && (
          <div style={{ marginBottom: 20 }}>
            <ET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
              def={{ fontSize: 26, color: t.fg, lineHeight: 1.6 }}
              style={{ opacity: 0.72 }}
              placeholder="서브 제목" />
          </div>
        )}
        {(s.description || editing) && (
          <ET s={s} field="description" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 18, color: t.fg, lineHeight: 1.82 }}
            style={{ opacity: 0.6, maxWidth: 580 }}
            placeholder="본문 내용" />
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   3. 좌우분할형 (leftRight)
   좌 45% 이미지 / 우 55% 제목+설명+포인트
══════════════════════════════════════════════════ */
export function TplLeftRight({ s, img, t, editing, onChange, secMeta, onSecMeta, onFieldFocus }) {
  const imgNode = img || (editing ? 'slot' : null)
  const pts = s.points || []
  const displayPts = editing ? (pts.length ? pts : ['']) : pts.filter(p => p && p.trim())
  const addPt = () => onChange('points', [...pts, ''])
  const delPt = i => onChange('points', pts.filter((_, j) => j !== i))
  const flipped = s.flipped || false

  const imgPanel = (
    <div style={{ flex: '0 0 387px', overflow: 'hidden', minHeight: 900 }}>
      {imgNode
        ? <ImgBox url={imgNode} t={t} editing={editing} onImgChange={v => onChange('secImg', v)}
            imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} fixedH={900} fitMode="cover" />
        : <div style={{ height: 900, background: t.sub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 48, opacity: 0.15 }}>📷</span>
          </div>
      }
    </div>
  )

  const txtPanel = (
    <div style={{ flex: '0 0 473px', background: t.bg, padding: '72px 60px 72px 52px',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 900, boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 20 }}>
        <ET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
          def={{ fontSize: 42, color: t.fg, fontWeight: 900, lineHeight: 1.22, letterSpacing: '-0.025em' }}
          placeholder="메인 제목" />
      </div>
      {(s.subCopy || editing) && (
        <div style={{ marginBottom: 20 }}>
          <ET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 22, color: t.fg, lineHeight: 1.55 }}
            style={{ opacity: 0.7 }}
            placeholder="서브 제목" />
        </div>
      )}
      {(s.description || editing) && (
        <div style={{ marginBottom: 28 }}>
          <ET s={s} field="description" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 16, color: t.fg, lineHeight: 1.8 }}
            style={{ opacity: 0.62 }}
            placeholder="본문 내용" />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {displayPts.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start',
            padding: '16px 0', borderBottom: `1px solid ${t.bd}` }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.ac,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 800 }}>✓</span>
            </div>
            {editing
              ? <PointInput value={p} onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }} onFocus={() => onFieldFocus?.('points')} />
              : <span style={{ fontSize: s.textStyles?.['points']?.fontSize ?? 17, fontFamily: s.textStyles?.['points']?.fontFamily || 'inherit', color: s.textStyles?.['points']?.color || t.fg, lineHeight: 1.72, opacity: 0.85, whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>{p}</span>
            }
            {editing && <button onClick={() => delPt(i)} style={delBtnInline}>×</button>}
          </div>
        ))}
      </div>
      {editing && (
        <div style={{ paddingTop: 16 }}>
          <button onClick={addPt} style={addBtnStyle}>+ 항목 추가</button>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ width: CARD_W, display: 'flex', overflow: 'hidden' }}>
      {flipped ? <>{txtPanel}{imgPanel}</> : <>{imgPanel}{txtPanel}</>}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   4. 포인트3단형 (points3icon)
   상단 제목+서브 / 하단 아이콘+제목+설명 3단 (이미지 없음)
   아이콘 크게 (96×96)
══════════════════════════════════════════════════ */
export function TplPoints3Icon({ s, img, t, editing, onChange, secMeta, onSecMeta, onFieldFocus }) {
  const pts = s.points || []
  const displayPts = pts.length ? pts : (editing ? ['', '', ''] : [])
  const cols = Math.max(1, Math.min(displayPts.length || 1, 3))
  const addPt = () => onChange('points', [...pts, ''])
  const delPt = i => onChange('points', pts.filter((_, j) => j !== i))
  const shape = s.pointShape || 'circle'

  return (
    <div style={{ width: CARD_W, background: t.bg }}>
      {/* 상단: 제목 + 서브 */}
      <div style={{ padding: '80px 72px 52px', textAlign: 'center' }}>
        <div style={{ marginBottom: 18 }}>
          <ET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 52, color: t.fg, fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.025em' }}
            placeholder="메인 제목" />
        </div>
        {(s.subCopy || editing) && (
          <ET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 24, color: t.fg, lineHeight: 1.6 }}
            style={{ opacity: 0.64 }}
            placeholder="서브 제목" />
        )}
        <div style={{ width: 48, height: 4, background: t.ac, borderRadius: 2, margin: '28px auto 0' }} />
      </div>

      {/* 하단: 3단 아이콘 카드 */}
      <div style={{ padding: '0 48px 88px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 28 }}>
          {displayPts.map((p, i) => {
            const lines = p.split('\n')
            const title = lines[0]?.trim() || `포인트 ${i + 1}`
            const desc  = lines.slice(1).join('\n').trim()
            return (
              <div key={i} style={{ position: 'relative', textAlign: 'center', background: t.sub,
                borderRadius: 24, padding: '52px 28px 48px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                {editing && <button onClick={() => delPt(i)} style={delBtnAbsolute}>×</button>}
                <div style={{ width: 96, height: 96, background: t.ac, margin: '0 auto 28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  ...shapeCSS(shape), boxShadow: `0 8px 24px ${t.ac}55` }}>
                  <span style={{ fontSize: 38, fontWeight: 800, color: '#fff' }}>{ROMAN[i % ROMAN.length]}</span>
                </div>
                {editing
                  ? <PointInput value={p} onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }} onFocus={() => onFieldFocus?.('points')} />
                  : <>
                      <p style={{ fontSize: s.textStyles?.['points']?.fontSize ?? 20, fontFamily: s.textStyles?.['points']?.fontFamily || 'inherit', fontWeight: 800, color: s.textStyles?.['points']?.color || t.fg, margin: '0 0 12px', lineHeight: 1.3, wordBreak: 'keep-all' }}>{title}</p>
                      {desc && <p style={{ fontSize: Math.max(14, (s.textStyles?.['points']?.fontSize ?? 20) - 5), fontFamily: s.textStyles?.['points']?.fontFamily || 'inherit', color: s.textStyles?.['points']?.color || t.fg, opacity: 0.62, margin: 0, lineHeight: 1.72, whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>{desc}</p>}
                    </>
                }
              </div>
            )
          })}
        </div>
        {editing && (
          <div style={{ textAlign: 'center', paddingTop: 24 }}>
            <button onClick={addPt} style={addBtnStyle}>+ 항목 추가</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   5. 스토리형 (story)
   상단 큰타이틀 / 중단 3컬럼(텍스트|이미지|포인트) / 하단 강조문구
══════════════════════════════════════════════════ */
export function TplStory({ s, img, t, editing, onChange, secMeta, onSecMeta, onFieldFocus }) {
  const imgNode = img || (editing ? 'slot' : null)
  const pts = s.points || []
  const displayPts = editing ? (pts.length ? pts : ['', '']) : pts.filter(p => p && p.trim())
  const addPt = () => onChange('points', [...pts, ''])
  const delPt = i => onChange('points', pts.filter((_, j) => j !== i))

  return (
    <div style={{ width: CARD_W, background: t.bg }}>
      {/* 상단: 큰 타이틀 */}
      <div style={{ padding: '80px 72px 32px' }}>
        <ET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
          def={{ fontSize: 56, color: t.fg, fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.028em' }}
          placeholder="메인 제목" />
        <div style={{ marginTop: 22, height: 4, width: 56, background: t.ac, borderRadius: 2 }} />
      </div>

      {/* 중단: 3컬럼 매거진 레이아웃 */}
      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 520 }}>
        {/* 왼쪽 텍스트 */}
        <div style={{ flex: '0 0 210px', padding: '32px 28px 32px 72px',
          display: 'flex', flexDirection: 'column', borderRight: `1px solid ${t.bd}` }}>
          <ET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 17, color: t.fg, lineHeight: 1.84 }}
            style={{ opacity: 0.75 }}
            placeholder="보조 설명 텍스트" />
        </div>
        {/* 중앙 이미지 */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {imgNode
            ? <ImgBox url={imgNode} t={t} editing={editing} onImgChange={v => onChange('secImg', v)}
                imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} fixedH={520} fitMode="cover" />
            : <div style={{ height: 520, background: t.sub }} />
          }
        </div>
        {/* 오른쪽 포인트 */}
        <div style={{ flex: '0 0 210px', padding: '32px 72px 32px 28px',
          display: 'flex', flexDirection: 'column', gap: 0, borderLeft: `1px solid ${t.bd}` }}>
          {displayPts.map((p, i) => (
            <div key={i} style={{
              paddingBottom: 20, marginBottom: i < displayPts.length - 1 ? 20 : 0,
              borderBottom: i < displayPts.length - 1 ? `1px solid ${t.bd}` : 'none'
            }}>
              {editing
                ? <PointInput value={p} onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }} onFocus={() => onFieldFocus?.('points')} />
                : <div style={{ fontSize: s.textStyles?.['points']?.fontSize ?? 16, fontFamily: s.textStyles?.['points']?.fontFamily || 'inherit', color: s.textStyles?.['points']?.color || t.fg, lineHeight: 1.76, opacity: 0.82, wordBreak: 'keep-all', whiteSpace: 'pre-wrap' }}>{p}</div>
              }
            </div>
          ))}
          {editing && (
            <button onClick={addPt} style={{ ...addBtnStyle, padding: '8px 16px', fontSize: 12, marginTop: 8 }}>+ 추가</button>
          )}
        </div>
      </div>

      {/* 하단: 강조 문구 */}
      {(s.description || editing) && (
        <div style={{ margin: '40px 72px 72px', padding: '32px 40px', background: t.ac, borderRadius: 14 }}>
          <ET s={s} field="description" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 24, color: '#fff', lineHeight: 1.6, fontWeight: 700 }}
            placeholder="강조 문구" />
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   6. 활용법형 (howTo)
   상단 제목박스(대비색 배경) / 중단 큰이미지 / 하단 번호+항목리스트
══════════════════════════════════════════════════ */
export function TplHowTo({ s, img, t, editing, onChange, secMeta, onSecMeta, onFieldFocus }) {
  const imgNode = img || (editing ? 'slot' : null)
  const pts = s.points || []
  const displayPts = editing ? (pts.length ? pts : ['', '', '']) : pts.filter(p => p && p.trim())
  const addPt = () => onChange('points', [...pts, ''])
  const delPt = i => onChange('points', pts.filter((_, j) => j !== i))

  return (
    <div style={{ width: CARD_W, background: t.bg }}>
      {/* 상단: 대비색 배경 헤더 */}
      <div style={{ padding: '60px 80px 52px', background: t.fg, textAlign: 'center' }}>
        {(s.description || editing) && (
          <div style={{ marginBottom: 16 }}>
            <ET s={s} field="description" editing={editing} onChange={onChange} onFocus={onFieldFocus}
              def={{ fontSize: 13, color: t.ac, fontWeight: 800, letterSpacing: '0.28em' }}
              style={{ textTransform: 'uppercase', display: 'inline-block' }}
              placeholder="카테고리" />
          </div>
        )}
        <ET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
          def={{ fontSize: 52, color: t.bg, fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.025em' }}
          placeholder="메인 제목" />
      </div>

      {/* 중단: 큰 이미지 */}
      {imgNode && (
        <ImgBox url={imgNode} t={t} editing={editing} onImgChange={v => onChange('secImg', v)}
          imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} fixedH={540} fitMode="cover" />
      )}

      {/* 서브타이틀 */}
      {(s.subCopy || editing) && (
        <div style={{ padding: '48px 80px 16px' }}>
          <ET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 30, color: t.fg, fontWeight: 700, lineHeight: 1.4, letterSpacing: '-0.015em' }}
            placeholder="서브 제목" />
        </div>
      )}

      {/* 하단: 번호 항목 리스트 */}
      <div style={{ padding: '16px 80px 80px' }}>
        {displayPts.map((p, i) => {
          const lines = p.split('\n')
          return (
            <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start',
              padding: '24px 0', borderBottom: `1px solid ${t.bd}` }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: t.ac,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1, paddingTop: 6 }}>
                {editing
                  ? <PointInput value={p} onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }} onFocus={() => onFieldFocus?.('points')} />
                  : <>
                      <div style={{ fontSize: s.textStyles?.['points']?.fontSize ?? 20, fontFamily: s.textStyles?.['points']?.fontFamily || 'inherit', fontWeight: 700, color: s.textStyles?.['points']?.color || t.fg, lineHeight: 1.4, marginBottom: 6, wordBreak: 'keep-all' }}>{lines[0]}</div>
                      {lines.slice(1).join('\n') && <div style={{ fontSize: Math.max(14, (s.textStyles?.['points']?.fontSize ?? 20) - 4), fontFamily: s.textStyles?.['points']?.fontFamily || 'inherit', color: s.textStyles?.['points']?.color || t.fg, opacity: 0.6, lineHeight: 1.72, whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>{lines.slice(1).join('\n')}</div>}
                    </>
                }
              </div>
              {editing && <button onClick={() => delPt(i)} style={delBtnInline}>×</button>}
            </div>
          )
        })}
        {editing && (
          <div style={{ paddingTop: 16 }}>
            <button onClick={addPt} style={addBtnStyle}>+ 항목 추가</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   7. 비교형 (compare)
   상단 타이틀 / 중단 비교표(✗/✓ 아이콘) / 하단 이미지
══════════════════════════════════════════════════ */
export function TplCompare({ s, img, t, editing, onChange, secMeta, onSecMeta, onFieldFocus }) {
  const imgNode = img || (editing ? 'slot' : null)
  const pts = s.points || []
  const displayPts = pts.length ? pts : (editing ? ['', '', ''] : [])
  const addPt = () => onChange('points', [...pts, ''])
  const delPt = i => onChange('points', pts.filter((_, j) => j !== i))

  return (
    <div style={{ width: CARD_W, background: t.bg }}>
      {/* 상단 타이틀 */}
      <div style={{ padding: '64px 64px 48px', textAlign: 'center' }}>
        <div style={{ marginBottom: 14 }}>
          <ET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 50, color: t.fg, fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.025em' }}
            placeholder="메인 제목" />
        </div>
        {(s.subCopy || editing) && (
          <ET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 24, color: t.fg, lineHeight: 1.55 }}
            style={{ opacity: 0.6 }}
            placeholder="서브 제목" />
        )}
      </div>

      {/* 비교표 */}
      <div style={{ padding: '0 56px 48px' }}>
        <div style={{ border: `2.5px solid ${t.ac}`, borderRadius: 18, overflow: 'hidden' }}>
          {/* 헤더 행 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '22px 32px', textAlign: 'center', background: '#f2f0ea', borderRight: `2.5px solid ${t.ac}` }}>
              <ET s={s} field="compareLeft" editing={editing} onChange={onChange} onFocus={onFieldFocus}
                def={{ fontSize: 16, color: '#888', fontWeight: 700 }}
                style={{ textAlign: 'center' }} placeholder="기존 제품" />
            </div>
            <div style={{ padding: '22px 32px', textAlign: 'center', background: t.ac }}>
              <ET s={s} field="compareRight" editing={editing} onChange={onChange} onFocus={onFieldFocus}
                def={{ fontSize: 16, color: '#fff', fontWeight: 800 }}
                style={{ textAlign: 'center' }} placeholder="이 제품" />
            </div>
          </div>
          {/* 비교 행들 */}
          {displayPts.map((p, i) => {
            const sep = p.indexOf('/')
            const a = sep >= 0 ? p.slice(0, sep).trim() : p.trim()
            const b = sep >= 0 ? p.slice(sep + 1).trim() : ''
            return editing ? (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', borderTop: `1px solid ${t.bd}` }}>
                <div style={{ padding: '12px 16px', borderRight: `2.5px solid ${t.ac}` }}>
                  <input value={a} onChange={e => { const n=[...pts]; n[i]=e.target.value+' / '+b; onChange('points',n) }}
                    placeholder="일반 제품"
                    style={{ width:'100%',fontSize:14,border:'1px solid #3b82f6',borderRadius:6,padding:'6px 10px',outline:'none',fontFamily:'inherit',boxSizing:'border-box' }} />
                </div>
                <div style={{ padding: '12px 16px' }}>
                  <input value={b} onChange={e => { const n=[...pts]; n[i]=a+' / '+e.target.value; onChange('points',n) }}
                    placeholder="이 제품"
                    style={{ width:'100%',fontSize:14,border:'1px solid #3b82f6',borderRadius:6,padding:'6px 10px',outline:'none',fontFamily:'inherit',boxSizing:'border-box' }} />
                </div>
                <div style={{ display:'flex',alignItems:'center',padding:'0 10px' }}>
                  <button onClick={() => delPt(i)} style={delBtnInline}>×</button>
                </div>
              </div>
            ) : (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${t.bd}`, background: i % 2 === 0 ? '#fafaf8' : '#fff' }}>
                <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 12, borderRight: `2.5px solid ${t.ac}` }}>
                  <span style={{ fontSize: 22, color: '#ef4444', flexShrink: 0, lineHeight: 1 }}>✗</span>
                  <span style={{ fontSize: 15, color: '#aaa', lineHeight: 1.5 }}>{a}</span>
                </div>
                <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22, color: '#22c55e', flexShrink: 0, lineHeight: 1 }}>✓</span>
                  <span style={{ fontSize: 15, color: t.ac, fontWeight: 700, lineHeight: 1.5 }}>{b || '—'}</span>
                </div>
              </div>
            )
          })}
        </div>
        {editing && (
          <div style={{ textAlign: 'center', paddingTop: 16 }}>
            <button onClick={addPt} style={addBtnStyle}>+ 비교 항목 추가</button>
          </div>
        )}
      </div>

      {/* 하단 제품 이미지 */}
      {imgNode && (
        <div style={{ padding: '0 56px 64px' }}>
          <ImgBox url={imgNode} t={t} editing={editing} onImgChange={v => onChange('secImg', v)}
            imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} />
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   8. 제품상세표시 (specTable)
   표 형태, 깔끔한 줄무늬
══════════════════════════════════════════════════ */
const SPEC_CATS = {
  food:   { label: '식품',    rows: ['제품명::','식품유형::','원산지::','유통기한::','중량::','원재료::','영양성분::','보관방법::','주의사항::'] },
  beauty: { label: '뷰티',    rows: ['제품명::','내용물::','사용기한::','사용방법::','주의사항::','제조사::','원산지::'] },
  living: { label: '생활용품', rows: ['제품명::','소재::','크기::','무게::','제조국::','인증::','주의사항::'] },
}

export function TplSpecTable({ s, img, t, editing, onChange, onFieldFocus }) {
  const cat = s.specCategory || 'food'
  const pts = s.points || []
  const displayPts = editing ? (pts.length ? pts : [...SPEC_CATS[cat].rows]) : pts.filter(p => p && p.trim())
  const addRow = () => onChange('points', [...pts, '항목::'])
  const delRow = i => onChange('points', pts.filter((_, j) => j !== i))
  const switchCat = k => { onChange('specCategory', k); onChange('points', [...SPEC_CATS[k].rows]) }

  return (
    <div style={{ width: CARD_W, background: t.bg }}>
      <div style={{ padding: '56px 64px 36px', borderBottom: `3px solid ${t.fg}` }}>
        {editing && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {Object.entries(SPEC_CATS).map(([k, v]) => (
              <button key={k} onClick={() => switchCat(k)}
                style={{ padding: '6px 18px', fontSize: 12, borderRadius: 20,
                  border: `1.5px solid ${cat===k ? t.ac : '#ccc'}`,
                  background: cat===k ? t.ac : '#fff',
                  color: cat===k ? '#fff' : '#666',
                  cursor: 'pointer', fontWeight: cat===k ? 700 : 400 }}>
                {v.label}
              </button>
            ))}
          </div>
        )}
        <div style={{ marginBottom: 10 }}>
          <ET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 50, color: t.fg, fontWeight: 900, letterSpacing: '-0.025em' }}
            placeholder="제품명" />
        </div>
        {(s.subCopy || editing) && (
          <ET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 16, color: t.fg, lineHeight: 1.65 }}
            style={{ opacity: 0.6 }}
            placeholder="제품 설명" />
        )}
      </div>
      <div style={{ padding: '0 64px 80px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 36 }}>
          <thead>
            <tr style={{ background: t.sub, borderBottom: `2.5px solid ${t.fg}` }}>
              <th style={{ padding: '16px 24px', fontSize: 14, fontWeight: 700, color: t.fg, textAlign: 'left', width: '28%', borderRight: `1px solid ${t.bd}` }}>항목</th>
              <th style={{ padding: '16px 24px', fontSize: 14, fontWeight: 700, color: t.fg, textAlign: 'left' }}>내용</th>
              {editing && <th style={{ width: 44 }} />}
            </tr>
          </thead>
          <tbody>
            {displayPts.map((p, i) => {
              const sep = p.indexOf('::')
              const key = sep >= 0 ? p.slice(0, sep) : p
              const val = sep >= 0 ? p.slice(sep + 2) : ''
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${t.bd}`, background: i % 2 === 0 ? t.bg : t.sub }}>
                  <td style={{ padding: '14px 24px', fontSize: 15, fontWeight: 600, color: t.fg, opacity: 0.75, borderRight: `1px solid ${t.bd}`, verticalAlign: 'middle' }}>
                    {editing
                      ? <input value={key} onChange={e => { const n=[...pts]; n[i]=e.target.value+'::'+val; onChange('points',n) }}
                          style={{ width:'100%',border:'1px solid #3b82f6',borderRadius:5,padding:'5px 8px',fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box' }} />
                      : key
                    }
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 15, color: t.fg, verticalAlign: 'middle' }}>
                    {editing
                      ? <input value={val} onChange={e => { const n=[...pts]; n[i]=key+'::'+e.target.value; onChange('points',n) }}
                          style={{ width:'100%',border:'1px solid #3b82f6',borderRadius:5,padding:'5px 8px',fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box' }} />
                      : val ? <span style={{ whiteSpace:'pre-wrap' }}>{val}</span> : <span style={{ color:'#ccc' }}>—</span>
                    }
                  </td>
                  {editing && (
                    <td style={{ textAlign:'center',padding:'0 8px',verticalAlign:'middle' }}>
                      <button onClick={() => delRow(i)}
                        style={{ width:24,height:24,borderRadius:6,border:'1px solid #fca5a5',background:'#fef2f2',color:'#ef4444',fontSize:13,cursor:'pointer',fontWeight:700,lineHeight:1 }}>×</button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        {editing && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <button onClick={addRow} style={addBtnStyle}>+ 행 추가</button>
          </div>
        )}
      </div>
    </div>
  )
}

export const TPL = {
  fullHero:    TplFullHero,
  topBottom:   TplTopBottom,
  leftRight:   TplLeftRight,
  points3icon: TplPoints3Icon,
  story:       TplStory,
  howTo:       TplHowTo,
  compare:     TplCompare,
  specTable:   TplSpecTable,
}
