// src/components/SectionEditor.jsx
import React, { useState, useRef, useEffect } from 'react'
import { C, DS, TPL_COMPAT } from '../constants'
import { TPL } from './SectionTemplates'

const BASE_CARD_W = 970

function getGradCSS(grad, t) {
  const alpha = (grad.alpha ?? 70) / 100
  const col   = grad.color || t.bg || '#000000'
  const m     = col.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  const rgb   = m ? `${parseInt(m[1],16)},${parseInt(m[2],16)},${parseInt(m[3],16)}` : '0,0,0'
  const dirs  = { top: 'to bottom', bottom: 'to top', left: 'to right', right: 'to left' }
  return `linear-gradient(${dirs[grad.dir] || 'to bottom'}, rgba(${rgb},${alpha}) 0%, rgba(${rgb},0) 60%)`
}

function OverlayTextBlock({ ot, containerRef, onUpdate, onRemove, isActive, onSelect }) {
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const startRef = useRef(null)
  const rsRef    = useRef(null)

  useEffect(() => {
    if (!resizing) return
    const onMove = e => {
      const { startX, startY, startSize, corner } = rsRef.current
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      const delta = corner === 'se' ? (dx + dy) / 4 : corner === 'nw' ? (-dx - dy) / 4 : corner === 'ne' ? (dx - dy) / 4 : (-dx + dy) / 4
      const newSize = Math.max(10, Math.min(120, Math.round(startSize + delta)))
      onUpdate({ ...ot, style: { ...(ot.style || {}), fontSize: newSize } })
    }
    const onUp = () => setResizing(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [resizing]) // eslint-disable-line

  useEffect(() => {
    if (!dragging) return
    const onMove = e => {
      const container = containerRef.current
      if (!container || !startRef.current) return
      const rect = container.getBoundingClientRect()
      const { mx, my, ox, oy } = startRef.current
      const nx = Math.max(0, Math.min(90, ox + (e.clientX - mx) / rect.width * 100))
      const ny = Math.max(0, Math.min(95, oy + (e.clientY - my) / rect.height * 100))
      onUpdate({ ...ot, x: nx, y: ny })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, ot, onUpdate, containerRef])

  const handleMD = e => {
    if (e.target.getAttribute('contenteditable') === 'true') return
    const container = containerRef.current
    if (!container) return
    startRef.current = { mx: e.clientX, my: e.clientY, ox: ot.x ?? 10, oy: ot.y ?? 10 }
    setDragging(true)
    onSelect(ot.id)
    e.preventDefault()
    e.stopPropagation()
  }

  const st = {
    fontSize:   ot.style?.fontSize   ?? 24,
    color:      ot.style?.color      ?? '#ffffff',
    fontFamily: ot.style?.fontFamily ?? "'Nanum Gothic', sans-serif",
    fontWeight: ot.style?.bold ? 700 : 400,
    lineHeight: 1.4,
    whiteSpace: 'pre-wrap',
    wordBreak:  'keep-all',
    textShadow: '0 2px 10px rgba(0,0,0,0.7)',
  }

  return (
    <div
      style={{
        position:'absolute', left:`${ot.x ?? 10}%`, top:`${ot.y ?? 10}%`, zIndex:15,
        cursor: dragging ? 'grabbing' : 'grab',
        border: isActive ? '2px solid #3b82f6' : '2px dashed rgba(153,153,153,0.7)',
        borderRadius:4, padding: '3px 6px',
      }}
      onMouseDown={handleMD}
      onClick={e => { onSelect(ot.id); e.stopPropagation() }}
    >
      <div style={{
        fontFamily: st.fontFamily, fontSize: st.fontSize, color: st.color,
        fontWeight: st.fontWeight, lineHeight: st.lineHeight,
        whiteSpace: st.whiteSpace, wordBreak: st.wordBreak, textShadow: st.textShadow,
      }}>
        <div
          contentEditable suppressContentEditableWarning
          style={{ outline:'none', cursor:'text', minWidth:20 }}
          onFocus={e => { onSelect(ot.id); e.stopPropagation() }}
          onBlur={e => onUpdate({ ...ot, text: e.currentTarget.innerText })}
          dangerouslySetInnerHTML={{ __html: ot.text || '텍스트' }}
        />
      </div>
      {isActive && (
        <>
          <button
            onClick={e => { e.stopPropagation(); onRemove(ot.id) }}
            style={{
              position:'absolute', top:-10, right:-10, width:20, height:20,
              borderRadius:'50%', background:'#ef4444', border:'none', color:'#fff',
              fontSize:13, fontWeight:700, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', zIndex:20,
            }}
          >×</button>
          {[['nw', { top: -5, left: -5 }, 'nw-resize'], ['ne', { top: -5, right: -5 }, 'ne-resize'],
            ['sw', { bottom: -5, left: -5 }, 'sw-resize'], ['se', { bottom: -5, right: -5 }, 'se-resize']].map(([corner, pos, cur]) => (
            <div key={corner}
              style={{ position:'absolute', ...pos, width:10, height:10, borderRadius:2, background:'#3b82f6', cursor:cur, zIndex:20, border:'1.5px solid #fff', boxShadow:'0 1px 4px rgba(0,0,0,0.25)' }}
              onMouseDown={e => {
                e.preventDefault(); e.stopPropagation()
                rsRef.current = { startX: e.clientX, startY: e.clientY, startSize: ot.style?.fontSize ?? 24, corner }
                setResizing(true)
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}

export default function SectionEditor({
  sec, idx, onUpdate,
  isSelected, onSelect,
  activeField, onActiveFieldChange,
  activeOverlay, onActiveOverlayChange,
  previewOnly = false,
}) {
  const [scale,   setScale]   = useState(1)
  const [hovered, setHovered] = useState(false)
  const ref     = useRef(null)
  const wrapRef = useRef(null)
  const snapRef = useRef(null)
  const canvasW = sec.canvas?.width || BASE_CARD_W
  const canvasH = sec.canvas?.height || 600
  const canvasScale = canvasW / BASE_CARD_W

  useEffect(() => {
    const handle = e => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return
      if (document.activeElement?.contentEditable === 'true') return
      const snap = snapRef.current
      if (snap?.activeOverlay) { snap.rmOverlay(snap.activeOverlay); e.preventDefault() }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [])

  useEffect(() => {
    const el = wrapRef.current; if (!el) return
    const obs = new ResizeObserver(() => setScale(Math.min(1, el.offsetWidth / canvasW)))
    obs.observe(el)
    return () => obs.disconnect()
  }, [canvasW])

  useEffect(() => {
    const inner = ref.current; if (!inner || !wrapRef.current) return
    const update = () => {
      if (wrapRef.current) wrapRef.current.style.height = `${canvasH * scale}px`
    }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(inner)
    return () => obs.disconnect()
  }, [scale, canvasH])

  const baseT = DS[sec.designStyle] || Object.values(DS)[0]
  const t     = { ...baseT, ...(sec.customColors || {}) }
  const secMeta = sec.imageMeta || {}

  const change     = (key, val) => onUpdate(idx, { ...sec, [key]: val })
  const updateImageMeta = (key, val) => onUpdate(idx, {
    ...sec,
    imageMeta: { ...(sec.imageMeta || {}), [key]: val },
  })
  const updOverlay = updated   => onUpdate(idx, {
    ...sec,
    overlayTexts: (sec.overlayTexts || []).map(ot => ot.id === updated.id ? updated : ot),
  })
  const rmOverlay = id => {
    onUpdate(idx, { ...sec, overlayTexts: (sec.overlayTexts || []).filter(ot => ot.id !== id) })
    if (activeOverlay === id) onActiveOverlayChange?.(null)
  }
  snapRef.current = { activeOverlay, rmOverlay }

  const grad   = sec.gradient || {}
  const tplKey = TPL[sec.template] ? sec.template : (TPL_COMPAT[sec.template] || 'topBottom')
  const Tpl    = TPL[tplKey] || TPL.topBottom
  const img    = sec.secImg || 'slot'

  return (
    <div
      onClick={e => { if (!previewOnly) onSelect?.(idx); e.stopPropagation() }}
      onMouseEnter={() => !previewOnly && setHovered(true)}
      onMouseLeave={() => !previewOnly && setHovered(false)}
      style={{ position: 'relative', cursor: 'default' }}
    >
      {/* 선택/호버 테두리 오버레이 — layout에 영향 없음 */}
      {!previewOnly && (isSelected || hovered) && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none',
          border: isSelected ? '3px solid #2563EB' : '2px solid #93C5FD',
        }} />
      )}

      {/* 섹션 배지 */}
      {false && !previewOnly && (isSelected || hovered) && (
        <div style={{
          position:'absolute', top:8, left:8, zIndex:21, pointerEvents:'none',
          background: isSelected ? '#3b82f6' : 'rgba(0,0,0,0.4)',
          color:'#fff', fontSize:10, fontWeight:700,
          padding:'2px 8px', borderRadius:4,
        }}>
          S{idx+1} · {sec.sectionType}
        </div>
      )}

      {/* 카드 미리보기 */}
      <div ref={wrapRef} style={{ position:'relative', overflow:'hidden' }}>
        <div style={{ width:canvasW, height:canvasH, transformOrigin:'top left', transform:`scale(${scale})` }}>
          <div
            ref={ref}
            data-sect-card
            data-canvas-width={canvasW}
            data-canvas-height={canvasH}
            style={{ fontFamily:"'Nanum Gothic','Apple SD Gothic Neo',sans-serif", width:canvasW, height:canvasH, position:'relative', overflow:'hidden' }}
          >
            <div style={{ width:BASE_CARD_W, transformOrigin:'top left', transform:`scale(${canvasScale})` }}>
              <Tpl
                s={sec} img={img} t={t} editing={!previewOnly} onChange={change}
                secMeta={secMeta}
                onSecMeta={updateImageMeta}
                onFieldFocus={f => { onActiveFieldChange?.(f); onActiveOverlayChange?.(null) }}
              />
            </div>
            {grad.dir && grad.dir !== 'none' && (
              <div style={{
                position:'absolute', inset:0, pointerEvents:'none', zIndex:8,
                background: getGradCSS(grad, t),
              }} />
            )}
            {(sec.overlayTexts || []).map(ot => (
              <OverlayTextBlock
                key={ot.id} ot={ot}
                containerRef={ref}
                isActive={activeOverlay === ot.id}
                onSelect={id => { onActiveOverlayChange?.(id); onActiveFieldChange?.(null) }}
                onUpdate={updOverlay}
                onRemove={rmOverlay}
              />
            ))}
            <div style={{ position:'absolute', right:20, bottom:8, fontSize:9, color:t.fg, opacity:0.1, zIndex:12 }}>
              ContentOS
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
