// src/App.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C, DS, DS_KEYS, TPL_LABELS, TPL_COMPAT, TASKS, BLOG_TONES, getSys, EXTRA_SECTIONS, getExtraSectSys, mkSec } from './constants'
import { parseBlocks, parseSections, capturePNG, downloadURL } from './utils'
import { generateContent } from './api/generate'
import { generateImage } from './api/images'
import SectionEditor from './components/SectionEditor'
import { FONT_OPTS, SHAPE_DEFS } from './components/SectionTemplates'
import CardNewsView from './components/CardNewsEditor'
import BlogKeywords from './components/BlogKeywords'
import BlogThumbnail from './components/BlogThumbnail'

/* ── 퀴즈 상수 ─────────────────────────────────────── */
const CATEGORIES = ['식품/음료', '뷰티/화장품', '생활용품', '패션/잡화', '건강/이너뷰티', '스포츠/레저', '디지털/가전', '반려동물', '기타']
const PRICE_RANGES = ['~1만원', '1~3만원', '3~5만원', '5~10만원', '10만원이상']
const GENDERS = ['여성', '남성', '무관']
const AGE_GROUPS = ['20대', '30대', '40대', '50대이상', '무관']
const PURCHASE_SITUATIONS = ['일상소비(자주구매하는생필품)', '특별한날(선물/기념일)', '문제해결(불편함/필요에의해)', '자기계발/취미', '건강/관리목적', '트렌드/유행따라']
const PRICE_POSITIONS = ['가성비/저가', '합리적중간가', '프리미엄']
const COMPETITION_TYPES = ['경쟁많은시장', '차별화포지션', '틈새시장']
const DIFF_TYPES = ['원산지/성분', '제조방식', '가격경쟁력', '디자인/패키지', '브랜드스토리', '인증/수상', '편의성/속도']
const PLANNING_STYLES = [
  { key: '문제해결형',   desc: 'Hero → 문제공감 → 해결제안 → 특징강조 → 비교 → CTA' },
  { key: '감성소구형',   desc: 'Hero → 감성스토리 → 사용장면 → 추천대상 → CTA' },
  { key: '전문성강조형', desc: 'Hero → 소재설명 → 특징강조 → 인증/수상 → CTA' },
  { key: '라이프스타일형', desc: 'Hero → 사용장면 → 사용장면2 → 추천대상 → CTA' },
  { key: '비교우위형',   desc: 'Hero → 문제공감 → 비교 → 특징강조 → CTA' },
  { key: '스토리텔링형', desc: 'Hero → 브랜드스토리 → 소재설명 → 사용장면 → CTA' },
]
const BRAND_TONES = ['따뜻한/감성적', '신뢰감/전문적', '힙/트렌디', '레트로/빈티지', '유머/B급', '고급스러운', '친근한/편안한']
const EMPHASIS_POINTS = ['품질/성능', '원산지/성분', '가격/가성비', '편의성', '브랜드스토리', '인증/수상', '환경/윤리', '디자인/패키지']

const EMPTY_QUIZ = {
  category: '', priceRange: '',
  gender: '', ageGroup: '', purchaseSituation: '',
  pricePosition: '', competition: '',
  differentiator: '', differentiatorTypes: [],
  planningStyle: '',
  brandTone: [],
  emphasis: [],
}

const GRAD_DIRS = [
  { k: 'none',   l: '없음' },
  { k: 'top',    l: '위' },
  { k: 'bottom', l: '아래' },
  { k: 'left',   l: '좌' },
  { k: 'right',  l: '우' },
]
const PRESET_COLORS = ['#ffffff','#111111','#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#0f172a','#fafaf8']
const sLabel = { fontSize:9, fontWeight:700, color:'#B0ADA5', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:4, marginTop:0 }

function TplIcon({ k }) {
  const d = '#9CA3AF', l = '#E5E7EB', a = '#6B7280'
  const base = { borderRadius:2, overflow:'hidden', width:'100%', height:32, position:'relative', flexShrink:0 }
  if (k === 'fullHero') return (
    <div style={{ ...base, background:d }}>
      <div style={{ position:'absolute',bottom:5,left:5,right:5,height:5,background:'rgba(255,255,255,0.35)',borderRadius:1 }} />
      <div style={{ position:'absolute',bottom:12,left:5,width:'55%',height:4,background:'rgba(255,255,255,0.6)',borderRadius:1 }} />
    </div>
  )
  if (k === 'topBottom') return (
    <div style={{ ...base, display:'flex',flexDirection:'column',gap:1 }}>
      <div style={{ flex:1,background:l,display:'flex',alignItems:'center',paddingLeft:4 }}>
        <div style={{ width:'55%',height:3,background:a,borderRadius:1,opacity:0.6 }} />
      </div>
      <div style={{ flex:1,background:d }} />
    </div>
  )
  if (k === 'leftRight') return (
    <div style={{ ...base, display:'flex',gap:1 }}>
      <div style={{ flex:1,background:d }} />
      <div style={{ flex:1,background:l,display:'flex',flexDirection:'column',justifyContent:'center',gap:2,padding:4 }}>
        <div style={{ height:3,background:a,borderRadius:1,opacity:0.7 }} />
        <div style={{ height:2,background:a,borderRadius:1,opacity:0.4 }} />
      </div>
    </div>
  )
  if (k === 'points3icon') return (
    <div style={{ ...base, display:'flex',flexDirection:'column',gap:1 }}>
      <div style={{ flex:2,background:d }} />
      <div style={{ flex:1,display:'flex',gap:1 }}>
        <div style={{ flex:1,background:l }} />
        <div style={{ flex:1,background:l }} />
        <div style={{ flex:1,background:l }} />
      </div>
    </div>
  )
  if (k === 'story') return (
    <div style={{ ...base, background:l,display:'flex',flexDirection:'column',justifyContent:'center',gap:3,padding:'4px 6px' }}>
      <div style={{ height:5,background:d,borderRadius:1,width:'80%' }} />
      <div style={{ height:2,background:a,borderRadius:1,opacity:0.5,width:'95%' }} />
      <div style={{ height:2,background:a,borderRadius:1,opacity:0.5,width:'70%' }} />
    </div>
  )
  if (k === 'howTo') return (
    <div style={{ ...base, display:'flex',flexDirection:'column',gap:1 }}>
      <div style={{ height:10,background:d,display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div style={{ height:3,width:'50%',background:'rgba(255,255,255,0.6)',borderRadius:1 }} />
      </div>
      <div style={{ flex:1,background:'#c5c9d0' }} />
      <div style={{ height:8,background:l,display:'flex',flexDirection:'column',justifyContent:'center',gap:1,padding:'0 4px' }}>
        <div style={{ height:2,background:a,borderRadius:1,opacity:0.5 }} />
      </div>
    </div>
  )
  if (k === 'compare') return (
    <div style={{ ...base, background:l,display:'flex',flexDirection:'column',gap:1,padding:3 }}>
      <div style={{ height:3,background:d,borderRadius:1,width:'55%',margin:'1px auto 3px' }} />
      <div style={{ flex:1,display:'flex',gap:1 }}>
        <div style={{ flex:1,background:'#d1d5db',borderRadius:1 }} />
        <div style={{ flex:1,background:d,borderRadius:1 }} />
      </div>
    </div>
  )
  if (k === 'specTable') return (
    <div style={{ ...base, background:'#FDFAF5',display:'flex',flexDirection:'column',gap:2,padding:3 }}>
      <div style={{ height:4,background:d,borderRadius:1,marginBottom:2 }} />
      {[1,2,3].map(i => (
        <div key={i} style={{ height:4,display:'flex',gap:1 }}>
          <div style={{ width:'30%',background:'#d0c8b8',borderRadius:1 }} />
          <div style={{ flex:1,background:l,borderRadius:1 }} />
        </div>
      ))}
    </div>
  )
  return <div style={{ ...base, background:l }} />
}

/* ── 미니 컴포넌트 ─────────────────────────────────── */
function Spin() {
  return <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: '2px solid #ddd', borderTopColor: '#555', animation: 'sp .6s linear infinite', flexShrink: 0 }} />
}

function CopyBtn({ text, label = '⎘ 복사' }) {
  const [ok, set] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); set(true); setTimeout(() => set(false), 2000) }} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: `1px solid ${C.bd}`, background: ok ? '#f0fdf4' : C.sur, color: ok ? '#15803d' : C.mu, cursor: 'pointer' }}>
      {ok ? '✓ 복사됨' : label}
    </button>
  )
}

function Blk({ title, lines }) {
  const tx = lines.join('\n').trim()
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C.fa, textTransform: 'uppercase' }}>{title}</span>
        <CopyBtn text={tx} />
      </div>
      <div style={{ background: C.alt, borderRadius: 10, border: `1px solid ${C.bd}`, padding: '14px 16px' }}>
        <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 13.5, lineHeight: 1.9, color: C.tx, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{tx}</pre>
      </div>
    </div>
  )
}

/* ── 섹션 사이 호버 추가 버튼 ────────────────────────── */
function AddBetweenHover({ onClick, loading }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      style={{ height: hov ? 44 : 10, transition:'height .15s', overflow:'hidden', display:'flex', alignItems:'center' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <button onClick={onClick} disabled={loading}
        style={{ width:'100%', height:34, fontSize:12, borderRadius:8, border:'1.5px dashed #3B82F6', background:'rgba(239,246,255,0.95)', color:'#3B82F6', cursor:loading?'not-allowed':'pointer', fontWeight:600 }}>
        {loading ? '생성 중…' : '+ 섹션 추가'}
      </button>
    </div>
  )
}

/* ── Canva 우측 편집 패널 ────────────────────────────── */
function CanvaPanel({ sec, idx, onUpdate, onDelete, activeField, activeOverlay, onAddOverlay, onAddSection, dlAll, onDlAll, onDlSection }) {
  const panelStyle = { width:'100%', height:'calc(100vh - 52px)', background:'#fff', boxShadow:'-4px 0 24px rgba(0,0,0,0.1)', display:'flex', flexDirection:'column', overflow:'hidden' }

  if (sec === null || idx === null) {
    return (
      <div style={{ ...panelStyle, alignItems:'center', justifyContent:'center', gap:12 }}>
        <p style={{ fontSize:12, color:C.mu, textAlign:'center', lineHeight:1.8, margin:0, padding:'0 24px' }}>섹션을 클릭해서<br/>편집하세요</p>
        {onAddSection && (
          <button onClick={onAddSection}
            style={{ padding:'8px 20px', fontSize:12, fontWeight:700, borderRadius:8, border:'1.5px dashed #10b981', background:'#f0fdf4', color:'#059669', cursor:'pointer', marginTop:8 }}>
            + 섹션 추가
          </button>
        )}
      </div>
    )
  }

  const baseT  = DS[sec.designStyle] || Object.values(DS)[0]
  const t      = { ...baseT, ...(sec.customColors || {}) }
  const tplKey = TPL_LABELS.find(x => x.k === sec.template) ? sec.template : (TPL_COMPAT[sec.template] || 'topBottom')
  const grad   = sec.gradient || {}

  const change  = (key, val) => onUpdate(idx, { ...sec, [key]: val })
  const setGrad = (key, val) => change('gradient', { ...grad, [key]: val })

  const hasActive    = activeField || activeOverlay
  const currentStyle = activeField
    ? (sec.textStyles?.[activeField] || {})
    : activeOverlay
      ? ((sec.overlayTexts || []).find(o => o.id === activeOverlay)?.style || {})
      : {}

  const ALL_FIELDS = ['mainCopy','subCopy','description','badge','cta','compareLeft','compareRight']
  const updateTS = (key, val) => {
    if (activeField) {
      change('textStyles', {
        ...(sec.textStyles || {}),
        [activeField]: { ...(sec.textStyles?.[activeField] || {}), [key]: val },
      })
    } else if (activeOverlay) {
      change('overlayTexts', (sec.overlayTexts || []).map(ot =>
        ot.id === activeOverlay ? { ...ot, style: { ...(ot.style || {}), [key]: val } } : ot
      ))
    } else {
      // 선택 없으면 섹션 전체 텍스트에 적용
      const newTS = { ...(sec.textStyles || {}) }
      ALL_FIELDS.forEach(f => { newTS[f] = { ...(newTS[f] || {}), [key]: val } })
      change('textStyles', newTS)
    }
  }

  return (
    <div style={panelStyle}>

      {/* 헤더 */}
      <div style={{ padding:'10px 14px', borderBottom:`1px solid ${C.bd}`, background:'#F8FAFF', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#3b82f6', flexShrink:0 }} />
          <span style={{ fontSize:12, fontWeight:700, color:'#1E40AF' }}>S{idx+1} · {sec.sectionType}</span>
        </div>
      </div>

      {/* 스크롤 컨트롤 영역 */}
      <div style={{ flex:1, overflowY:'auto', padding:'8px 12px 10px' }}>

        {/* 레이아웃 */}
        <p style={sLabel}>레이아웃</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:3, marginBottom:8 }}>
          {TPL_LABELS.map(({k,l}) => {
            const on = tplKey === k
            return (
              <button key={k} onClick={() => change('template', k)}
                style={{ padding:'4px 4px 4px', fontSize:9, borderRadius:6, border:`1.5px solid ${on?'#3b82f6':C.bd}`, background:on?'#EFF6FF':C.sur, color:on?'#1d4ed8':C.mu, cursor:'pointer', fontWeight:on?700:400, textAlign:'center', display:'flex', flexDirection:'column', gap:3, alignItems:'stretch' }}>
                <TplIcon k={k} />
                <span style={{ lineHeight:1.2, marginTop:1 }}>{l}</span>
              </button>
            )
          })}
        </div>

        {/* 색상 테마 */}
        <p style={sLabel}>색상 테마</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:3, marginBottom:8 }}>
          {DS_KEYS.map(s => {
            const on = sec.designStyle === s && !Object.keys(sec.customColors || {}).length; const d = DS[s]
            return (
              <button key={s} onClick={() => onUpdate(idx, { ...sec, designStyle: s, customColors: {} })}
                style={{ borderRadius:7, border:`2px solid ${on?'#3b82f6':'transparent'}`, cursor:'pointer', padding:0, overflow:'hidden', background:'none', outline:'none' }}>
                <div style={{ height:22, background:d.bg, display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:d.ac }} />
                  <div style={{ width:10, height:2, borderRadius:2, background:d.fg, opacity:0.4 }} />
                </div>
                <div style={{ padding:'2px', background:on?'#EFF6FF':C.alt, fontSize:8, color:on?'#1d4ed8':C.mu, fontWeight:on?700:400, textAlign:'center', lineHeight:1.3 }}>{s}</div>
              </button>
            )
          })}
        </div>

        {/* 커스텀 색상 */}
        <p style={sLabel}>커스텀 색상</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginBottom:8 }}>
          {[{ label:'배경색', key:'bg' }, { label:'강조색', key:'ac' }, { label:'글자색', key:'fg' }].map(({ label, key }) => (
            <div key={key} style={{ display:'flex', flexDirection:'column', gap:3, alignItems:'center' }}>
              <span style={{ fontSize:9, color:C.mu }}>{label}</span>
              <label style={{ cursor:'pointer', position:'relative' }}>
                <div style={{ width:44, height:24, borderRadius:5, background:(sec.customColors?.[key]) || t[key], border:`1.5px solid ${C.bd}`, cursor:'pointer' }} />
                <input type="color" value={(sec.customColors?.[key]) || t[key] || '#ffffff'}
                  onChange={e => change('customColors', { ...(sec.customColors||{}), [key]: e.target.value })}
                  style={{ position:'absolute', opacity:0, width:0, height:0, top:0, left:0 }} />
              </label>
              {sec.customColors?.[key] && (
                <button onClick={() => { const cc={...(sec.customColors||{})}; delete cc[key]; change('customColors',cc) }}
                  style={{ fontSize:8, color:'#ef4444', border:'none', background:'none', cursor:'pointer', padding:0 }}>초기화</button>
              )}
            </div>
          ))}
        </div>

        {/* 그라데이션 */}
        <p style={sLabel}>그라데이션</p>
        <div style={{ marginBottom:8 }}>
          <div style={{ display:'flex', gap:3, flexWrap:'wrap', marginBottom:6 }}>
            {GRAD_DIRS.map(({k,l}) => {
              const on = (grad.dir || 'none') === k
              return (
                <button key={k} onClick={() => setGrad('dir', k)}
                  style={{ padding:'4px 10px', fontSize:10, borderRadius:5, border:`1.5px solid ${on?'#3b82f6':C.bd}`, background:on?'#EFF6FF':C.sur, color:on?'#1d4ed8':C.mu, cursor:'pointer', fontWeight:on?700:400 }}>
                  {l}
                </button>
              )
            })}
          </div>
          {grad.dir && grad.dir !== 'none' && (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:10, color:C.mu }}>강도</span>
                  <span style={{ fontSize:10, fontWeight:700, color:C.tx }}>{grad.alpha ?? 70}%</span>
                </div>
                <input type="range" min={0} max={100} step={5}
                  value={grad.alpha ?? 70}
                  onChange={e => setGrad('alpha', +e.target.value)}
                  style={{ width:'100%', accentColor:'#3b82f6' }} />
              </div>
              <label style={{ fontSize:9, color:C.mu, display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
                <span>색상</span>
                <input type="color" value={grad.color || t.bg || '#000000'}
                  onChange={e => setGrad('color', e.target.value)}
                  style={{ width:26, height:18, border:'1px solid #ccc', padding:0, cursor:'pointer', borderRadius:3 }} />
                {grad.color && (
                  <button onClick={() => { const g2={...grad}; delete g2.color; change('gradient',g2) }}
                    style={{ fontSize:8, color:'#ef4444', border:'none', background:'none', cursor:'pointer' }}>배경색으로</button>
                )}
              </label>
            </div>
          )}
        </div>

        {/* 폰트 */}
        <p style={sLabel}>폰트 {!hasActive && <span style={{ fontWeight:400, letterSpacing:0, textTransform:'none', color:'#a0a09a' }}>(선택 없으면 전체 적용)</span>}</p>
        {activeOverlay && (
          <div style={{ fontSize:10, color:'#1d4ed8', background:'#EFF6FF', padding:'3px 8px', borderRadius:5, marginBottom:5 }}>
            📌 추가 텍스트 블록 편집 중
          </div>
        )}
        {activeField === 'points' && (
          <div style={{ fontSize:10, color:'#059669', background:'#f0fdf4', padding:'3px 8px', borderRadius:5, marginBottom:5 }}>
            📋 항목 리스트 편집 중
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:3, marginBottom:3 }}>
          {FONT_OPTS.map(f => {
            const on = currentStyle.fontFamily === f.v
            return (
              <button key={f.v} onClick={() => updateTS('fontFamily', f.v)}
                style={{ padding:'6px 8px', fontSize:11, borderRadius:6, border:`1.5px solid ${on?'#3b82f6':C.bd}`, background:on?'#EFF6FF':C.sur, color:on?'#1d4ed8':C.mu, cursor:'pointer', fontWeight:on?700:400, textAlign:'left', fontFamily:f.v, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {f.l}
              </button>
            )
          })}
        </div>
        <button onClick={() => updateTS('bold', !currentStyle.bold)}
          style={{ width:'100%', padding:'5px 0', fontSize:11, borderRadius:6, border:`1.5px solid ${currentStyle.bold?'#3b82f6':C.bd}`, background:currentStyle.bold?'#EFF6FF':C.sur, color:currentStyle.bold?'#1d4ed8':C.mu, cursor:'pointer', fontWeight:currentStyle.bold?700:400, marginBottom:8 }}>
          <strong>B</strong> 굵게
        </button>

        {/* 선택된 텍스트 스타일 */}
        {hasActive && (
          <>
            <div style={{ borderTop:`1px solid ${C.bd}`, margin:'4px 0 12px' }} />
            <p style={sLabel}>선택된 텍스트</p>
            <div style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:10, color:C.mu }}>크기</span>
                <span style={{ fontSize:10, fontWeight:700, color:C.tx }}>{currentStyle.fontSize ?? 24}px</span>
              </div>
              <input type="range" min={12} max={80} step={1}
                value={currentStyle.fontSize ?? 24}
                onChange={e => updateTS('fontSize', +e.target.value)}
                style={{ width:'100%', accentColor:'#3b82f6' }} />
            </div>
            <div style={{ marginBottom:12 }}>
              <span style={{ fontSize:10, color:C.mu, display:'block', marginBottom:5 }}>글자색</span>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap', alignItems:'center' }}>
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => updateTS('color', c)}
                    style={{ width:22, height:22, borderRadius:4, background:c,
                      border: currentStyle.color===c ? '2px solid #3b82f6' : '1px solid #ccc',
                      cursor:'pointer', flexShrink:0 }} />
                ))}
                <input type="color" value={currentStyle.color || '#111111'}
                  onChange={e => updateTS('color', e.target.value)}
                  style={{ width:28, height:22, border:'1px solid #ccc', padding:0, cursor:'pointer', borderRadius:4, flexShrink:0 }} />
              </div>
            </div>
          </>
        )}

        {/* 항목 리스트 스타일 */}
        <div style={{ borderTop:`1px solid ${C.bd}`, margin:'4px 0 8px' }} />
        <p style={sLabel}>항목 리스트 크기</p>
        <div style={{ marginBottom:4 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
            <span style={{ fontSize:10, color:C.mu }}>크기</span>
            <span style={{ fontSize:10, fontWeight:700, color:C.tx }}>{sec.textStyles?.['points']?.fontSize ?? 18}px</span>
          </div>
          <input type="range" min={14} max={36} step={1}
            value={sec.textStyles?.['points']?.fontSize ?? 18}
            onChange={e => change('textStyles', { ...(sec.textStyles||{}), points: { ...(sec.textStyles?.['points']||{}), fontSize: +e.target.value } })}
            style={{ width:'100%', accentColor:'#3b82f6' }} />
        </div>
        <div style={{ marginBottom:8 }}>
          <span style={{ fontSize:10, color:C.mu, display:'block', marginBottom:4 }}>글자색</span>
          <div style={{ display:'flex', gap:3, flexWrap:'wrap', alignItems:'center' }}>
            {PRESET_COLORS.map(c => (
              <button key={c} onClick={() => change('textStyles', { ...(sec.textStyles||{}), points: { ...(sec.textStyles?.['points']||{}), color: c } })}
                style={{ width:20, height:20, borderRadius:3, background:c, border: sec.textStyles?.['points']?.color===c ? '2px solid #3b82f6' : '1px solid #ccc', cursor:'pointer', flexShrink:0 }} />
            ))}
            <input type="color" value={sec.textStyles?.['points']?.color || '#111111'}
              onChange={e => change('textStyles', { ...(sec.textStyles||{}), points: { ...(sec.textStyles?.['points']||{}), color: e.target.value } })}
              style={{ width:26, height:20, border:'1px solid #ccc', padding:0, cursor:'pointer', borderRadius:3, flexShrink:0 }} />
          </div>
        </div>

        {/* 텍스트 추가 */}
        <button onClick={onAddOverlay}
          style={{ width:'100%', padding:'8px 0', fontSize:12, fontWeight:700, borderRadius:7, border:'1.5px dashed #3b82f6', background:'#EFF6FF', color:'#1d4ed8', cursor:'pointer', marginBottom:8 }}>
          + 텍스트 추가
        </button>

        {/* 아이콘 모양 (points3icon) */}
        {tplKey === 'points3icon' && (
          <>
            <div style={{ borderTop:`1px solid ${C.bd}`, margin:'4px 0 12px' }} />
            <p style={sLabel}>아이콘 모양</p>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:10 }}>
              {SHAPE_DEFS.map(({ k, l }) => {
                const on = (sec.pointShape || 'circle') === k
                return (
                  <button key={k} onClick={() => change('pointShape', k)}
                    style={{ padding:'5px 10px', fontSize:10, borderRadius:6, border:`1.5px solid ${on?'#3b82f6':C.bd}`, background:on?'#EFF6FF':C.sur, color:on?'#1d4ed8':C.mu, cursor:'pointer', fontWeight:on?700:400 }}>
                    {l}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* 좌우반전 (leftRight) */}
        {tplKey === 'leftRight' && (
          <>
            <div style={{ borderTop:`1px solid ${C.bd}`, margin:'4px 0 12px' }} />
            <button onClick={() => change('flipped', !sec.flipped)}
              style={{ width:'100%', padding:'8px 0', fontSize:12, borderRadius:7, border:'1px solid #3b82f6', background:'#EFF6FF', color:'#1d4ed8', cursor:'pointer', fontWeight:700, marginBottom:10 }}>
              ⇄ 좌우 반전
            </button>
          </>
        )}

        {/* 섹션 추가 / 삭제 */}
        <div style={{ borderTop:`1px solid ${C.bd}`, margin:'6px 0 8px' }} />
        <button onClick={onAddSection}
          style={{ width:'100%', padding:'8px 0', fontSize:12, fontWeight:700, borderRadius:7, border:'1.5px dashed #10b981', background:'#f0fdf4', color:'#059669', cursor:'pointer', marginBottom:6 }}>
          + 섹션 추가
        </button>
        <button onClick={onDelete}
          style={{ width:'100%', padding:'8px 0', fontSize:12, fontWeight:700, borderRadius:7, border:'1px solid #fca5a5', background:'#fef2f2', color:'#ef4444', cursor:'pointer' }}>
          × 섹션 삭제
        </button>
      </div>

      {/* 하단 PNG 버튼 */}
      <div style={{ borderTop:`1px solid ${C.bd}`, padding:'10px 12px', background:'#F8FAFF', flexShrink:0, display:'flex', gap:6, flexDirection:'column' }}>
        <button onClick={onDlSection}
          style={{ width:'100%', padding:'8px 0', fontSize:11, fontWeight:700, borderRadius:7, border:'1px solid #1d6b45', background:'#f0fdf4', color:'#1d6b45', cursor:'pointer' }}>
          ↓ 선택 PNG
        </button>
        <button onClick={onDlAll} disabled={dlAll}
          style={{ width:'100%', padding:'8px 0', fontSize:11, fontWeight:700, borderRadius:7, border:`1px solid ${dlAll?C.bd:C.bdm}`, background:dlAll?C.alt:C.tx, color:dlAll?C.fa:'#fff', cursor:dlAll?'not-allowed':'pointer' }}>
          {dlAll ? '저장 중…' : '↓ 전체 PNG'}
        </button>
      </div>
    </div>
  )
}

/* ── 선택 버튼 그룹 ─────────────────────────────────── */
function OptionBtns({ options, value, onChange, multi = false, maxSelect = null }) {
  const isSel = opt => multi ? value.includes(opt) : value === opt
  const toggle = opt => {
    if (multi) {
      if (value.includes(opt)) onChange(value.filter(o => o !== opt))
      else if (!maxSelect || value.length < maxSelect) onChange([...value, opt])
    } else {
      onChange(value === opt ? '' : opt)
    }
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(opt => {
        const sel = isSel(opt)
        const maxed = multi && maxSelect && !sel && value.length >= maxSelect
        return (
          <button key={opt} onClick={() => !maxed && toggle(opt)}
            style={{ padding: '7px 13px', borderRadius: 9, border: sel ? '2px solid #1D6B45' : `1.5px solid ${C.bd}`, background: sel ? '#E9F7F0' : C.sur, color: sel ? '#1D6B45' : C.tx, fontSize: 12.5, fontWeight: sel ? 700 : 400, cursor: maxed ? 'not-allowed' : 'pointer', opacity: maxed ? 0.45 : 1, transition: 'all .12s' }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

/* ── 스텝 카드 ──────────────────────────────────────── */
function StepCard({ stepNum, label, done, children }) {
  return (
    <div style={{ background: C.sur, borderRadius: 14, border: done ? `1.5px solid ${C.bd}` : '1.5px solid #FECACA', marginBottom: 10, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', background: done ? C.alt : '#FFF5F5', borderBottom: `1px solid ${done ? C.bd : '#FECACA'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: done ? '#1D6B45' : '#EF4444', color: '#fff', fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {done ? '✓' : stepNum}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.tx }}>STEP {stepNum} — {label}</span>
        <span style={{ fontSize: 10, color: done ? '#1D6B45' : '#EF4444', marginLeft: 'auto', fontWeight: 600 }}>{done ? '완료' : '필수'}</span>
      </div>
      <div style={{ padding: '14px 16px 6px' }}>{children}</div>
    </div>
  )
}

/* ── 서브 질문 ──────────────────────────────────────── */
function SubQ({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: C.mu, marginBottom: 7, margin: '0 0 7px' }}>{label}</p>
      {children}
    </div>
  )
}

async function generateSectionImages(sections, onProgress) {
  const targets = sections.filter(s => s.imagePrompt && !s.secImg)
  const next = sections.map(s => ({ ...s }))

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    const idx = next.findIndex(s => s._id === target._id)
    if (idx < 0) continue

    onProgress?.(`AI 이미지 생성 중 (${i + 1}/${targets.length})`)

    try {
      const image = await generateImage({
        prompt: target.imagePrompt,
        size: '1024x1536',
        quality: 'medium',
      })
      next[idx] = { ...next[idx], secImg: image, imageStatus: 'generated' }
    } catch (e) {
      next[idx] = { ...next[idx], imageStatus: 'failed', imageError: e.message }
      console.error(e)
    }
  }

  onProgress?.('')
  return next
}

/* ── 추가 섹션 AI 출력 파서 ─────────────────────────── */
function parseExtraSection(text, typeInfo) {
  const gf = (k, t) => { const rx = new RegExp(k + ':\\s*([^\\n]+)'); const f = t.match(rx); return f ? f[1].trim() : '' }
  const gb = (k, t) => {
    const rx = new RegExp(k + ':\\s*\\n([\\s\\S]*?)(?=\\n[가-힣A-Za-z]+:|$)')
    const f = t.match(rx); if (!f) return []
    return f[1].split('\n').map(l => l.replace(/^[\s•\-\d\.]+/, '').trim()).filter(l => l.length > 1)
  }
  return mkSec({
    sectionType: typeInfo.label,
    template: typeInfo.template,
    designStyle: typeInfo.designStyle || '크림',
    mainCopy: gf('메인카피', text),
    subCopy:  gf('서브카피', text),
    points:   gb('포인트', text),
  })
}

/* ── 상세페이지 결과 뷰 ─────────────────────────────── */
function DetailView({ result, savedSects, onSectsChange, productInput, quiz }) {
  const top    = parseBlocks(result)
  const rep    = top.find(b => b.title === '기획 보고서')
  const ptMeta = top.find(b => b.title.includes('Page Title'))
  const seo    = top.find(b => b.title.includes('SEO'))

  const ptText   = ptMeta?.lines.join('\n') || ''
  const pageTitle = ptText.match(/Page Title:\s*(.+)/)?.[1]?.trim() || ''
  const metaDesc  = ptText.match(/Meta Description:\s*(.+)/)?.[1]?.trim() || ''
  const [sects,    setSects]    = useState(() => savedSects ?? parseSections(result))
  const [planOpen, setPlanOpen] = useState({})
  const [dlAll,      setDlAll]      = useState(false)
  const [addLoading, setAddLoading] = useState(null)
  const [addModal,   setAddModal]   = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [selectedIdx,  setSelectedIdx]  = useState(() => {
    const s = savedSects ?? parseSections(result)
    return s.length > 0 ? 0 : null
  })
  const [activeField,  setActiveField]  = useState(null)
  const [activeOverlay,setActiveOverlay]= useState(null)
  const sectsInit = useRef(false)

  useEffect(() => {
    if (!sectsInit.current) { sectsInit.current = true; return }
    onSectsChange?.(sects)
  }, [sects])

  const upd = useCallback((i, v) => setSects(p => p.map((s, j) => j === i ? v : s)), [])

  const selectSection = useCallback((idx) => {
    setSelectedIdx(idx)
    setActiveField(null)
    setActiveOverlay(null)
  }, [])

  const deleteSection = useCallback(i => {
    setSects(p => p.filter((_, j) => j !== i))
    setPlanOpen({})
    setSelectedIdx(prev => {
      if (prev === null) return null
      if (prev === i) { setActiveField(null); setActiveOverlay(null); return null }
      return prev > i ? prev - 1 : prev
    })
  }, [])

  const addSection = useCallback(async (typeInfo, insertAfterIdx) => {
    setAddModal(null)
    setAddLoading(typeInfo.type)
    try {
      const text = await generateContent({
        systemPrompt: getExtraSectSys(typeInfo.type),
        userPrompt: productInput?.trim()
          ? `다음 제품 정보를 참고해서 "${typeInfo.label}" 섹션을 만들어줘:\n${productInput}`
          : `"${typeInfo.label}" 섹션 내용을 작성해줘.`,
        model: 'gpt-4o',
        maxTokens: 700,
      })
      const ns = { ...parseExtraSection(text, typeInfo), _userAdded: true }
      setSects(p => { const n = [...p]; n.splice(insertAfterIdx + 1, 0, ns); return n })
    } catch {
      const ns = mkSec({ sectionType: typeInfo.label, template: typeInfo.template, designStyle: typeInfo.designStyle || '크림', _userAdded: true })
      setSects(p => { const n = [...p]; n.splice(insertAfterIdx + 1, 0, ns); return n })
    } finally {
      setAddLoading(null)
    }
  }, [productInput])

  const addOverlay = useCallback(() => {
    if (selectedIdx === null) return
    const id  = Math.random().toString(36).slice(2, 9)
    const newOt = { id, text: '텍스트', x: 10, y: 20, style: { fontSize: 28, color: '#ffffff', fontFamily: "'Nanum Gothic', sans-serif" } }
    const sec = sects[selectedIdx]
    upd(selectedIdx, { ...sec, overlayTexts: [...(sec.overlayTexts || []), newOt] })
    setActiveOverlay(id)
    setActiveField(null)
  }, [selectedIdx, sects, upd])

  const dlAllPNG = async () => {
    setDlAll(true)
    const els = document.querySelectorAll('[data-sect-card]')
    for (let i = 0; i < els.length; i++) {
      try { await capturePNG(els[i], `section_${i + 1}.png`); await new Promise(r => setTimeout(r, 600)) }
      catch (e) { console.error(e) }
    }
    setDlAll(false)
  }

  const dlSectionPNG = async () => {
    if (selectedIdx === null) return
    const els = document.querySelectorAll('[data-sect-card]')
    const el  = els[selectedIdx]
    if (!el) return
    setDlAll(true)
    try { await capturePNG(el, `section_${selectedIdx + 1}.png`) }
    catch (e) { console.error(e) }
    finally { setDlAll(false) }
  }

  return (
    <div>
      {rep && (
        <div style={{ background: '#FFFFFF', padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.tx, letterSpacing: '-0.02em' }}>📋 기획 보고서</span>
            <CopyBtn text={rep.lines.join('\n').trim()} />
          </div>
          <div style={{ background: C.alt, borderRadius: 10, border: `1px solid ${C.bd}`, padding: '14px 16px' }}>
            <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 13.5, lineHeight: 1.9, color: C.tx, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{rep.lines.join('\n').trim()}</pre>
          </div>
        </div>
      )}

      {(pageTitle || metaDesc) && (
        <div style={{ background: '#EFF6FF', padding: '20px 0', borderTop: '1px solid #BFDBFE', borderBottom: '1px solid #BFDBFE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#1E40AF', letterSpacing: '-0.02em' }}>🔍 Page Title & Meta Description</span>
            <span style={{ fontSize: 11, color: '#3B82F6' }}>— SEO 최적화</span>
          </div>
          {pageTitle && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF' }}>Page Title</span>
                <CopyBtn text={pageTitle} />
              </div>
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #BFDBFE', padding: '10px 14px', fontSize: 13.5, color: C.tx, lineHeight: 1.7 }}>{pageTitle}</div>
            </div>
          )}
          {metaDesc && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF' }}>Meta Description</span>
                <CopyBtn text={metaDesc} />
              </div>
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #BFDBFE', padding: '10px 14px', fontSize: 13.5, color: C.tx, lineHeight: 1.7 }}>{metaDesc}</div>
            </div>
          )}
        </div>
      )}

      {sects.length > 0 && (
        <div style={{ background: '#FEFCE8', padding: '20px 0 24px', borderTop: '1px solid #FEF08A', borderBottom: '1px solid #FEF08A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#713F12', letterSpacing: '-0.02em' }}>📐 섹션별 기획안</span>
            <span style={{ fontSize: 11, color: '#A16207' }}>— 촬영 가이드 · AI 프롬프트 포함</span>
          </div>
          {sects.map((s, i) => {
            let sp = {}
            try { sp = JSON.parse(s.photoDir || '{}') } catch {}
            return (
              <div key={s._id || i} style={{ marginBottom: 6, border: `1px solid ${C.bd}`, borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => setPlanOpen(o => ({ ...o, [i]: !o[i] }))} style={{ width: '100%', padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: planOpen[i] ? '#ECEAE5' : C.sur, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.mu, background: C.alt, padding: '1px 7px', borderRadius: 4, border: `1px solid ${C.bd}` }}>S{i + 1}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.tx }}>{s.sectionType}</span>
                    {s.mainCopy && <span style={{ fontSize: 11, color: C.mu }}>— {s.mainCopy}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700 }}>{planOpen[i] ? '접기' : '열어보기'}</span>
                    {s._userAdded && (
                      <span onClick={e => { e.stopPropagation(); deleteSection(i) }}
                        style={{ fontSize: 12, color: '#ef4444', fontWeight: 700, cursor: 'pointer', padding: '2px 7px', borderRadius: 4, background: '#fef2f2', border: '1px solid #fca5a5', lineHeight: 1 }}>×</span>
                    )}
                  </div>
                </button>
                {planOpen[i] && (
                  <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.bd}` }}>
                    <pre style={{ margin: '0 0 12px', fontFamily: 'inherit', fontSize: 12.5, lineHeight: 1.85, color: C.tx, whiteSpace: 'pre-wrap' }}>
                      {[
                        s.mainCopy && `메인: ${s.mainCopy}`,
                        s.subCopy && `서브: ${s.subCopy}`,
                        s.points?.length && `\n포인트:\n${s.points.map((p, j) => `  ${j + 1}. ${p}`).join('\n')}`,
                      ].filter(Boolean).join('\n')}
                    </pre>
                    {Object.keys(sp).length > 0 && (
                      <div style={{ background: C.alt, borderRadius: 7, padding: '10px 13px', border: `1px solid ${C.bd}`, marginBottom: 10 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, marginBottom: 6 }}>📷 촬영 기획</p>
                        {Object.entries(sp).map(([k, v], j) => <div key={j} style={{ fontSize: 12, color: C.tx, marginBottom: 3 }}><span style={{ color: C.mu, fontWeight: 600 }}>{k}:</span> {v}</div>)}
                      </div>
                    )}
                    {s.imagePrompt && (
                      <>
                        <div style={{ background: '#111', borderRadius: 7, padding: '9px 12px', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <code style={{ fontSize: 11, color: '#D4D4D4', fontFamily: "'Courier New',monospace", lineHeight: 1.7, flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{s.imagePrompt}</code>
                          <CopyBtn text={s.imagePrompt} />
                        </div>
                        <p style={{ margin: '8px 0 0', fontSize: 11, color: C.mu, lineHeight: 1.8 }}>
                          💡 프롬프트를 복사하고, ChatGPT 또는 미드저니에서<br />
                          여기 업로드한 제품 사진과 함께 사용하세요.<br />
                          사진을 같이 올리면 더 정확한 이미지가 생성됩니다.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {sects.length > 0 && (
        <div style={{ background:'#F5F2ED', paddingTop:32, paddingBottom:60 }}>
          <div style={{ display:'flex', alignItems:'flex-start' }}>
            {/* 캔버스 */}
            <div style={{ flex:1, minWidth:0 }}
              onClick={() => setSelectedIdx(null)}
            >
              <div
                style={{ boxShadow:'0 8px 48px rgba(0,0,0,0.15)' }}
                onClick={e => e.stopPropagation()}
              >
                {sects.map((s, i) => (
                  <SectionEditor
                    key={s._id || i}
                    sec={s} idx={i} onUpdate={upd}
                    isSelected={selectedIdx === i}
                    onSelect={selectSection}
                    activeField={selectedIdx === i ? activeField : null}
                    onActiveFieldChange={f => { setActiveField(f); setActiveOverlay(null) }}
                    activeOverlay={selectedIdx === i ? activeOverlay : null}
                    onActiveOverlayChange={id => { setActiveOverlay(id); setActiveField(null) }}
                  />
                ))}
              </div>
            </div>
            {/* 스티키 편집 패널 */}
            <div style={{ width:340, flexShrink:0, position:'sticky', top:52, alignSelf:'flex-start' }}>
              <CanvaPanel
                sec={selectedIdx !== null ? sects[selectedIdx] : null}
                idx={selectedIdx}
                onUpdate={upd}
                onDelete={() => selectedIdx !== null && setDeleteConfirm(selectedIdx)}
                onAddSection={() => setAddModal(selectedIdx ?? sects.length - 1)}
                activeField={activeField}
                activeOverlay={activeOverlay}
                onAddOverlay={addOverlay}
                dlAll={dlAll}
                onDlAll={dlAllPNG}
                onDlSection={dlSectionPNG}
              />
            </div>
          </div>
        </div>
      )}

      {seo && (
        <div style={{ marginTop: 20 }}>
          <Blk title={seo.title} lines={seo.lines} />
        </div>
      )}

      {addModal !== null && (
        <div onClick={() => setAddModal(null)}
          style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:16, padding:'24px', maxWidth:480, width:'90%', maxHeight:'80vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <span style={{ fontSize:14, fontWeight:700, color:C.tx }}>추가할 섹션 선택</span>
              <button onClick={() => setAddModal(null)}
                style={{ width:28, height:28, borderRadius:'50%', border:'none', background:C.alt, cursor:'pointer', fontSize:18, color:C.mu, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>×</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
              {EXTRA_SECTIONS.map(sec => (
                <button key={sec.type} onClick={() => addSection(sec, addModal)}
                  style={{ padding:'12px 14px', borderRadius:10, border:`1px solid ${C.bd}`, background:C.sur, cursor:'pointer', textAlign:'left', transition:'border-color .12s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#3b82f6'}
                  onMouseLeave={e => e.currentTarget.style.borderColor=C.bd}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.tx }}>{sec.label}</div>
                  <div style={{ fontSize:11, color:C.fa, marginTop:3 }}>{sec.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {deleteConfirm !== null && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:14, padding:'28px 32px', maxWidth:320, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', textAlign:'center' }}>
            <p style={{ fontSize:15, fontWeight:600, color:C.tx, margin:'0 0 6px' }}>섹션을 삭제하시겠습니까?</p>
            <p style={{ fontSize:12, color:C.fa, margin:'0 0 24px' }}>이 작업은 되돌릴 수 없습니다.</p>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ padding:'9px 24px', borderRadius:8, border:`1px solid ${C.bd}`, background:C.sur, color:C.mu, cursor:'pointer', fontWeight:600, fontSize:13 }}>취소</button>
              <button onClick={() => { deleteSection(deleteConfirm); setDeleteConfirm(null) }}
                style={{ padding:'9px 24px', borderRadius:8, border:'none', background:'#ef4444', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:13 }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 메인 앱 ───────────────────────────────────────── */
export default function App() {
  const [task, setTask] = useState(TASKS[0])
  const [tone, setTone] = useState('생활형')
  const [tabLoading, setTabLoading] = useState({})
  const [error, setError] = useState('')

  // 새로고침 시 전체 초기화
  useEffect(() => {
    ;['cos_input','cos_quiz','cos_result_detail','cos_result_blog','cos_result_card',
      'cos_card_data','cos_detail_data','cos_history'].forEach(k => {
      try { localStorage.removeItem(k) } catch {}
    })
  }, [])

  // 공통 제품 정보
  const [sharedInput, setSharedInput] = useState('')

  // 7단계 퀴즈
  const [quiz, setQuiz] = useState({ ...EMPTY_QUIZ })

  const updQuiz = useCallback((key, val) => setQuiz(q => ({ ...q, [key]: val })), [])

  useEffect(() => {
    try { localStorage.setItem('cos_input', sharedInput) } catch {}
  }, [sharedInput])

  useEffect(() => {
    try { localStorage.setItem('cos_quiz', JSON.stringify(quiz)) } catch {}
  }, [quiz])

  // 단계 완료 여부
  const step1Done = !!(sharedInput.trim() && quiz.category && quiz.priceRange)
  const step2Done = !!(quiz.gender && quiz.ageGroup && quiz.purchaseSituation)
  const step3Done = !!(quiz.pricePosition && quiz.competition)
  const step4Done = !!(quiz.differentiator.trim())
  const step5Done = !!(quiz.planningStyle)
  const step6Done = quiz.brandTone.length > 0
  const step7Done = quiz.emphasis.length > 0
  const allDone = step1Done && step2Done && step3Done && step4Done && step5Done && step6Done && step7Done

  // 탭별 결과
  const [tabResults, setTabResults] = useState(() => {
    const r = {}
    for (const t of TASKS) { r[t.id] = '' }
    return r
  })
  const result = tabResults[task.id] || ''

  const saveResult = useCallback((tid, text) => {
    setTabResults(prev => ({ ...prev, [tid]: text }))
    try { localStorage.setItem(`cos_result_${tid}`, text) } catch {}
  }, [])

  // 카드/섹션 에디터 상태
  const [cardData,   setCardData]   = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [cardGenKey,   setCardGenKey]   = useState(0)
  const [detailGenKey, setDetailGenKey] = useState(0)

  const saveCardData = useCallback((cards) => {
    setCardData(cards)
    try {
      try {
        const dd = localStorage.getItem('cos_detail_data')
        if (dd) {
          const p = JSON.parse(dd)
          if (p.some(s => s.secImg || s.secImg2 || s.secImg3 || s.secImg4))
            localStorage.setItem('cos_detail_data', JSON.stringify(p.map(s => ({ ...s, secImg: null, secImg2: null, secImg3: null, secImg4: null }))))
        }
      } catch {}
      localStorage.setItem('cos_card_data', JSON.stringify(cards))
    } catch {
      try { localStorage.setItem('cos_card_data', JSON.stringify(cards.map(c => ({ ...c, image: null })))) } catch {}
    }
  }, [])

  const saveDetailData = useCallback((sects) => {
    setDetailData(sects)
    try {
      try {
        const cd = localStorage.getItem('cos_card_data')
        if (cd) {
          const p = JSON.parse(cd)
          if (p.some(c => c.image))
            localStorage.setItem('cos_card_data', JSON.stringify(p.map(c => ({ ...c, image: null }))))
        }
      } catch {}
      localStorage.setItem('cos_detail_data', JSON.stringify(sects))
    } catch {
      try { localStorage.setItem('cos_detail_data', JSON.stringify(sects.map(s => ({ ...s, secImg: null, secImg2: null, secImg3: null, secImg4: null })))) } catch {}
    }
  }, [])

  const [keywordContext, setKeywordContext] = useState('')
  const [history, setHistory] = useState([])
  const [histOpen, setHistOpen] = useState(false)
  const [titleHover, setTitleHover] = useState(false)

  const taRef       = useRef(null)
  const diffRef     = useRef(null)
  const resRef      = useRef(null)
  const imgUploadRef = useRef(null)

  // 제품 사진 업로드
  const [productImgs, setProductImgs] = useState([])
  const [autoGenerateImages, setAutoGenerateImages] = useState(true)
  const [imageGenStatus, setImageGenStatus] = useState('')
  const handleProductImgs = e => {
    const files = Array.from(e.target.files)
    const remaining = 5 - productImgs.length
    files.slice(0, remaining).forEach(f => {
      const fr = new FileReader()
      fr.onload = ev => setProductImgs(prev => prev.length < 5 ? [...prev, ev.target.result] : prev)
      fr.readAsDataURL(f)
    })
    e.target.value = ''
  }

  // textarea 자동 높이
  useEffect(() => {
    if (!taRef.current) return
    taRef.current.style.height = 'auto'
    taRef.current.style.height = Math.max(120, taRef.current.scrollHeight) + 'px'
  }, [sharedInput])

  useEffect(() => {
    if (!diffRef.current) return
    diffRef.current.style.height = 'auto'
    diffRef.current.style.height = Math.max(72, diffRef.current.scrollHeight) + 'px'
  }, [quiz.differentiator])

  useEffect(() => {
    try { localStorage.setItem('cos_history', JSON.stringify(history.slice(0, 20))) } catch {}
  }, [history])

  const sw = t => {
    setTask(t)
    setError('')
  }

  const resetAll = () => {
    setSharedInput('')
    setQuiz({ ...EMPTY_QUIZ })
    setProductImgs([])
    const empty = {}
    for (const t of TASKS) {
      empty[t.id] = ''
      try { localStorage.removeItem(`cos_result_${t.id}`) } catch {}
    }
    setTabResults(empty)
    setCardData(null);   try { localStorage.removeItem('cos_card_data')   } catch {}
    setDetailData(null); try { localStorage.removeItem('cos_detail_data') } catch {}
    setTask(TASKS[0])
    setError('')
    setKeywordContext('')
    try { localStorage.removeItem('cos_input'); localStorage.removeItem('cos_quiz') } catch {}
  }

  const run = async () => {
    if (!sharedInput.trim() || !allDone || tabLoading[task.id]) return
    const tid = task.id
    setTabLoading(prev => ({ ...prev, [tid]: true }))
    saveResult(tid, '')
    setError('')
    try {
      const userPrompt = (tid === 'blog' && keywordContext)
        ? `다음 키워드를 자연스럽게 포함하고, 아래 내용을 참고해서 블로그 글을 작성해줘.\n키워드: ${keywordContext}\n참고 내용: ${sharedInput.trim()}`
        : sharedInput.trim()
      const hasImgs = tid === 'detail' && productImgs.length > 0
      const quizOpts = { ...quiz }
      const sysBase = getSys(tid, tone, quizOpts)
      const systemPrompt = hasImgs
        ? sysBase + '\n\n업로드된 제품 사진을 분석해서 제품의 외형·색상·패키지 디자인을 파악하고, 각 섹션 AI프롬프트에 실제 제품의 시각적 특성(색상, 형태, 질감, 소재감)을 구체적으로 반영해줘.'
        : sysBase
      const text = await generateContent({
        systemPrompt,
        userPrompt,
        images: hasImgs ? productImgs : [],
        model: 'gpt-4o',
        maxTokens: tid === 'detail' ? 4000 : 2000,
      })
      saveResult(tid, text)
      if (tid === 'card') {
        setCardData(null); try { localStorage.removeItem('cos_card_data') } catch {}
        setCardGenKey(k => k + 1)
      }
      if (tid === 'detail') {
        setImageGenStatus('')
        if (autoGenerateImages) {
          const generated = await generateSectionImages(parseSections(text), setImageGenStatus)
          saveDetailData(generated)
        } else {
          setDetailData(null); try { localStorage.removeItem('cos_detail_data') } catch {}
        }
        setDetailGenKey(k => k + 1)
      }
      const h = { id: Date.now(), taskId: tid, label: task.label, preview: sharedInput.slice(0, 60), result: text, ts: new Date().toISOString() }
      setHistory(p => [h, ...p].slice(0, 20))
      setTimeout(() => resRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e) {
      setError('오류: ' + e.message)
    } finally {
      setImageGenStatus('')
      setTabLoading(prev => ({ ...prev, [tid]: false }))
    }
  }

  const topBlocks = result ? parseBlocks(result) : []

  const blogTitle = (() => {
    if (task.id !== 'blog' || !result) return ''
    const block = topBlocks.find(b => b.title.includes('제목'))
    if (!block) return ''
    const line = block.lines.find(l => /^\d[..]/.test(l.trim()))
    return line ? line.replace(/^\d+[..]\s*/, '').trim() : ''
  })()

  const loading = tabLoading[task.id] || false

  const incompletedSteps = [
    !step1Done && 'STEP 1',
    !step2Done && 'STEP 2',
    !step3Done && 'STEP 3',
    !step4Done && 'STEP 4',
    !step5Done && 'STEP 5',
    !step6Done && 'STEP 6',
    !step7Done && 'STEP 7',
  ].filter(Boolean)

  return (
    <>
      {/* ── 고정 네비게이션 ── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, background: 'rgba(245,244,240,0.97)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${C.bd}`, height: 52, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
        <button onClick={() => setHistOpen(o => !o)}
          style={{ width: 32, height: 32, borderRadius: 7, border: 'none', background: histOpen ? C.alt : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.mu, fontSize: 18, flexShrink: 0 }}>
          {histOpen ? '‹' : '≡'}
        </button>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: C.tx, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>C</div>
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.04em' }}>ContentOS</span>
        <span style={{ fontSize: 10, color: C.fa, background: '#ECEAE5', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>BETA</span>
      </header>

      {/* ── 사이드바 (히스토리) ── */}
      <aside style={{ position: 'fixed', top: 52, left: 0, bottom: 0, zIndex: 50, width: histOpen ? 260 : 0, transition: 'width .22s ease', background: C.sur, borderRight: histOpen ? `1px solid ${C.bd}` : 'none', overflow: 'hidden' }}>
        <div style={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${C.bd}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: C.tx }}>히스토리</span>
            {history.length > 0 && <span style={{ fontSize: 10, background: C.alt, color: C.mu, borderRadius: 20, padding: '1px 7px', fontWeight: 600 }}>{history.length}</span>}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px 20px' }}>
            {history.length === 0
              ? <p style={{ fontSize: 12, color: C.fa, textAlign: 'center', marginTop: 32 }}>아직 기록 없음</p>
              : history.map(h => {
                  const tk = TASKS.find(t => t.id === h.taskId) || TASKS[0]
                  return (
                    <button key={h.id} onClick={() => {
                      const tk2 = TASKS.find(t => t.id === h.taskId) || TASKS[0]
                      setTask(tk2)
                      saveResult(h.taskId, h.result)
                      if (h.taskId === 'card') { setCardData(null); try { localStorage.removeItem('cos_card_data') } catch {}; setCardGenKey(k => k + 1) }
                      if (h.taskId === 'detail') { setDetailData(null); try { localStorage.removeItem('cos_detail_data') } catch {}; setDetailGenKey(k => k + 1) }
                      setTimeout(() => resRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
                    }} style={{ width: '100%', textAlign: 'left', padding: '9px 10px', borderRadius: 8, border: `1px solid ${C.bd}`, background: C.sur, cursor: 'pointer', marginBottom: 5, display: 'block' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                        <span style={{ fontSize: 14 }}>{tk.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: tk.col }}>{tk.label}</span>
                        <span style={{ fontSize: 10, color: C.fa, marginLeft: 'auto' }}>{new Date(h.ts).toLocaleString('ko', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.mu, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{h.preview}</div>
                    </button>
                  )
                })}
          </div>
        </div>
      </aside>

      {/* ── 메인 콘텐츠 ── */}
      <div style={{ marginLeft: histOpen ? 260 : 0, transition: 'margin-left .22s ease', paddingTop: 52, minHeight: '100vh', background: C.bg, color: C.tx }}>
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 8px 100px' }}>

          {/* 타이틀 (클릭 시 전체 리셋) */}
          <div onClick={resetAll} onMouseEnter={() => setTitleHover(true)} onMouseLeave={() => setTitleHover(false)}
            style={{ textAlign: 'center', marginBottom: 32, cursor: 'pointer', opacity: titleHover ? 0.6 : 1, transition: 'opacity .15s' }}>
            <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1.2, margin: '0 0 8px' }}>제품 정보 하나로 마케팅 콘텐츠 완성</h1>
            <p style={{ fontSize: 13, color: C.mu, lineHeight: 1.75, margin: 0 }}>7단계 입력 → 상세페이지 · 블로그 · 카드뉴스 자동 생성</p>
          </div>

          {/* ── STEP 1: 제품 기본 정보 ── */}
          <StepCard stepNum={1} label="제품 기본 정보" done={step1Done}>
            <SubQ label="제품 정보 (필수) — 제품명, 특징, 가격, 판매 정보 등 자유롭게">
              <textarea ref={taRef} value={sharedInput} onChange={e => setSharedInput(e.target.value)}
                placeholder="예) 듀라론 냉감패드 — 3중 레이어 구조, 여름 특화, 19,900원, 싱글/더블/퀸 사이즈"
                style={{ width: '100%', minHeight: 120, padding: '12px 14px', border: `1.5px solid ${sharedInput.trim() ? C.bd : '#FECACA'}`, borderRadius: 10, outline: 'none', resize: 'none', fontSize: 14, lineHeight: 1.85, color: C.tx, background: C.alt, fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .15s' }}
              />
            </SubQ>

            <SubQ label="제품 사진 업로드 (선택, 최대 5장) — AI 이미지 프롬프트 정확도 향상">
              <input ref={imgUploadRef} type="file" accept="image/*" multiple onChange={handleProductImgs} style={{ display: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => imgUploadRef.current?.click()} disabled={productImgs.length >= 5}
                  style={{ padding: '5px 12px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: productImgs.length >= 5 ? C.fa : C.mu, cursor: productImgs.length >= 5 ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                  📷 사진 추가 ({productImgs.length}/5)
                </button>
                {productImgs.map((img, i) => (
                  <div key={i} style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 7, border: `1px solid ${C.bd}`, display: 'block' }} />
                    <button onClick={() => setProductImgs(p => p.filter((_, j) => j !== i))}
                      style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', border: '2px solid #fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, padding: 0 }}>×</button>
                  </div>
                ))}
              </div>
            </SubQ>

            <SubQ label="AI 이미지 생성">
              <label style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:12.5, color:C.tx, cursor:'pointer', userSelect:'none' }}>
                <input
                  type="checkbox"
                  checked={autoGenerateImages}
                  onChange={e => setAutoGenerateImages(e.target.checked)}
                  style={{ width:16, height:16, accentColor:'#1D6B45' }}
                />
                상세페이지 섹션 이미지를 자동 생성해서 배치
              </label>
              <p style={{ margin:'6px 0 0', fontSize:11, color:C.fa, lineHeight:1.6 }}>
                내부 프롬프트를 사용해 생성하며, 사용자 화면에는 프롬프트를 직접 노출하지 않습니다.
              </p>
            </SubQ>

            <SubQ label="카테고리">
              <OptionBtns options={CATEGORIES} value={quiz.category} onChange={v => updQuiz('category', v)} />
            </SubQ>

            <SubQ label="가격대">
              <OptionBtns options={PRICE_RANGES} value={quiz.priceRange} onChange={v => updQuiz('priceRange', v)} />
            </SubQ>
          </StepCard>

          {/* ── STEP 2: 타겟 고객 ── */}
          <StepCard stepNum={2} label="타겟 고객" done={step2Done}>
            <SubQ label="주 구매 성별">
              <OptionBtns options={GENDERS} value={quiz.gender} onChange={v => updQuiz('gender', v)} />
            </SubQ>
            <SubQ label="주 구매 연령대">
              <OptionBtns options={AGE_GROUPS} value={quiz.ageGroup} onChange={v => updQuiz('ageGroup', v)} />
            </SubQ>
            <SubQ label="구매 상황">
              <OptionBtns options={PURCHASE_SITUATIONS} value={quiz.purchaseSituation} onChange={v => updQuiz('purchaseSituation', v)} />
            </SubQ>
          </StepCard>

          {/* ── STEP 3: 시장 포지셔닝 ── */}
          <StepCard stepNum={3} label="시장 포지셔닝" done={step3Done}>
            <SubQ label="가격 포지션">
              <OptionBtns options={PRICE_POSITIONS} value={quiz.pricePosition} onChange={v => updQuiz('pricePosition', v)} />
            </SubQ>
            <SubQ label="경쟁 상황">
              <OptionBtns options={COMPETITION_TYPES} value={quiz.competition} onChange={v => updQuiz('competition', v)} />
            </SubQ>
          </StepCard>

          {/* ── STEP 4: 나만의 차별점 ── */}
          <StepCard stepNum={4} label="나만의 차별점" done={step4Done}>
            <SubQ label="핵심 차별점 (필수)">
              <textarea ref={diffRef} value={quiz.differentiator} onChange={e => updQuiz('differentiator', e.target.value)}
                placeholder="우리 제품만의 특별한 점을 입력해주세요&#10;예) 국내 유일 48시간 저온 숙성 공법, 농가 직거래 계약 재배, 첨가물 無"
                style={{ width: '100%', minHeight: 72, padding: '10px 13px', border: `1.5px solid ${quiz.differentiator.trim() ? C.bd : '#FECACA'}`, borderRadius: 10, outline: 'none', resize: 'none', fontSize: 13.5, lineHeight: 1.8, color: C.tx, background: C.alt, fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .15s' }}
              />
            </SubQ>
            <SubQ label="차별점 유형 (복수 선택)">
              <OptionBtns multi options={DIFF_TYPES} value={quiz.differentiatorTypes} onChange={v => updQuiz('differentiatorTypes', v)} />
            </SubQ>
          </StepCard>

          {/* ── STEP 5: 기획 방식 ── */}
          <StepCard stepNum={5} label="기획 방식 — 섹션 구성 순서 결정" done={step5Done}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
              {PLANNING_STYLES.map(ps => {
                const sel = quiz.planningStyle === ps.key
                return (
                  <button key={ps.key} onClick={() => updQuiz('planningStyle', sel ? '' : ps.key)}
                    style={{ padding: '12px 14px', borderRadius: 10, border: sel ? '2px solid #1D6B45' : `1.5px solid ${C.bd}`, background: sel ? '#E9F7F0' : C.sur, textAlign: 'left', cursor: 'pointer', transition: 'all .12s' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: sel ? '#1D6B45' : C.tx, marginBottom: 4 }}>{ps.key}</div>
                    <div style={{ fontSize: 10.5, color: sel ? '#2D8A5E' : C.fa, lineHeight: 1.55 }}>{ps.desc}</div>
                  </button>
                )
              })}
            </div>
          </StepCard>

          {/* ── STEP 6: 브랜드 톤 ── */}
          <StepCard stepNum={6} label="브랜드 톤" done={step6Done}>
            <p style={{ fontSize: 11, color: C.fa, margin: '0 0 8px' }}>최대 2개 선택 ({quiz.brandTone.length}/2)</p>
            <OptionBtns multi maxSelect={2} options={BRAND_TONES} value={quiz.brandTone} onChange={v => updQuiz('brandTone', v)} />
          </StepCard>

          {/* ── STEP 7: 강조 포인트 ── */}
          <StepCard stepNum={7} label="강조 포인트" done={step7Done}>
            <p style={{ fontSize: 11, color: C.fa, margin: '0 0 8px' }}>최대 2개 선택 ({quiz.emphasis.length}/2)</p>
            <OptionBtns multi maxSelect={2} options={EMPHASIS_POINTS} value={quiz.emphasis} onChange={v => updQuiz('emphasis', v)} />
          </StepCard>

          {/* ── 콘텐츠 유형 선택 + 생성하기 ── */}
          <div style={{ background: '#EFF6FF', borderRadius: 16, border: `1.5px solid ${allDone ? '#BFDBFE' : '#FECACA'}`, overflow: 'hidden', marginBottom: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '10px 16px', background: '#DBEAFE', borderBottom: '1px solid #BFDBFE' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF' }}>콘텐츠 유형 선택</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TASKS.length},1fr)`, gap: 8, padding: '10px 14px', borderBottom: `1px solid ${C.bd}` }}>
              {TASKS.map(t => {
                const on = task.id === t.id
                const hasResult = !!(tabResults[t.id])
                return (
                  <button key={t.id} onClick={() => sw(t)}
                    style={{ padding: '11px 8px', borderRadius: 10, border: on ? `2px solid ${t.col}` : `1.5px solid ${C.bd}`, background: on ? t.li : C.sur, cursor: 'pointer', textAlign: 'center', position: 'relative' }}>
                    {hasResult && !on && <span style={{ position: 'absolute', top: 5, right: 7, width: 6, height: 6, borderRadius: '50%', background: t.col, opacity: 0.7 }} />}
                    <div style={{ fontSize: 18, marginBottom: 3, color: on ? t.col : C.fa }}>{t.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: on ? t.col : C.tx, letterSpacing: '-0.02em' }}>{t.label}</div>
                    <div style={{ fontSize: 10, color: on ? t.col + '99' : C.fa, marginTop: 1 }}>{t.sub}</div>
                  </button>
                )
              })}
            </div>

            {/* 블로그 전용 옵션 */}
            {task.id === 'blog' && (
              <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${C.bd}`, background: '#F8F8FF' }}>
                <BlogKeywords onKeywordsChange={setKeywordContext} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: C.mu, fontWeight: 600 }}>블로그 말투</span>
                  {BLOG_TONES.map(t => (
                    <button key={t} onClick={() => setTone(t)}
                      style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: tone === t ? `1.5px solid ${TASKS[1].col}` : `1.5px solid ${C.bd}`, background: tone === t ? TASKS[1].li : C.sur, color: tone === t ? TASKS[1].col : C.mu, cursor: 'pointer' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 상태 + 생성 버튼 */}
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {allDone
                  ? <p style={{ fontSize: 11, color: '#1D6B45', fontWeight: 700, margin: 0 }}>✓ 모든 단계 완료 — 생성하기를 눌러주세요</p>
                  : <p style={{ fontSize: 11, color: '#EF4444', margin: 0 }}>미완료: {incompletedSteps.join(', ')}</p>
                }
              </div>
              <button onClick={run} disabled={!allDone || loading}
                style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: (!allDone || loading) ? '#ECEAE5' : C.tx, color: (!allDone || loading) ? C.fa : '#fff', fontSize: 13, fontWeight: 700, cursor: (!allDone || loading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0, transition: 'background .12s' }}>
                {loading ? <><Spin />생성 중…</> : `✦ ${task.label} 생성하기`}
              </button>
            </div>
          </div>

          {/* 에러 */}
          {error && <div style={{ padding: '12px 15px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, fontSize: 13, color: '#b91c1c', marginBottom: 14 }}>{error}</div>}

          {/* 로딩 */}
          {loading && (
            <div style={{ background: C.sur, borderRadius: 14, border: `1.5px solid ${C.bd}`, padding: '28px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22, color: C.mu, fontSize: 13 }}>
                <Spin />{task.id === 'detail' ? (imageGenStatus || '상세페이지 섹션 생성 중…') : task.id === 'card' ? '카드뉴스 5장 생성 중…' : '블로그 포스팅 생성 중…'}
              </div>
              {[95, 75, 85, 60, 90, 50].map((w, i) => <div key={i} style={{ height: 10, background: C.alt, borderRadius: 5, width: `${w}%`, marginBottom: 9, animation: `pl 1.5s ease ${i * .12}s infinite` }} />)}
            </div>
          )}

          {/* 결과 */}
          {result && !loading && (
            task.id === 'detail' ? (
              <div ref={resRef}>
                <DetailView key={detailGenKey} result={result} savedSects={detailData} onSectsChange={saveDetailData} productInput={sharedInput} quiz={quiz} />
              </div>
            ) : (
              <div ref={resRef} style={{ background: C.sur, borderRadius: 16, border: `1.5px solid ${C.bd}`, boxShadow: '0 4px 28px rgba(0,0,0,0.06)', overflow: 'hidden', animation: 'fi .25s ease' }}>
                <div style={{ padding: '12px 20px 10px', borderBottom: `1px solid ${C.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: task.col, background: task.li, padding: '2px 9px', borderRadius: 20 }}>{task.label}</span>
                    <span style={{ fontSize: 11, color: '#15803d', background: '#f0fdf4', padding: '2px 8px', borderRadius: 20 }}>✓ 완성</span>
                  </div>
                  <CopyBtn text={result} />
                </div>
                <div style={{ padding: '16px 20px' }}>
                  {task.id === 'card'
                    ? <CardNewsView key={cardGenKey} result={result} savedCards={cardData} onCardsChange={saveCardData} />
                    : <>
                        {topBlocks.map((b, i) => <Blk key={i} title={b.title} lines={b.lines} />)}
                        {task.id === 'blog' && <BlogThumbnail key={result.slice(0, 40)} blogTitle={blogTitle} />}
                      </>
                  }
                </div>
              </div>
            )
          )}

        </main>
      </div>
    </>
  )
}
