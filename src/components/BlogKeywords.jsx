// src/components/BlogKeywords.jsx
import React, { useState } from 'react'
import { C } from '../constants'
import { parseApiResponse } from '../api/http'

const BLOG_COL = '#1A3FA3'
const BLOG_LI  = '#EBF1FF'
const MAX_SEL  = 5

const toNum = v => (typeof v === 'string' && v.includes('<')) ? 5 : (parseInt(v) || 0)

function fmt(raw) {
  const n = toNum(raw)
  if (n < 10)     return '< 10'
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
  if (n >= 1000)  return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

// 선택된 키워드 이름만 쉼표 구분으로 반환 (App에서 프롬프트 조립)
function buildContext(list, sel) {
  const items = list.filter(k => sel.has(k.relKeyword))
  if (!items.length) return ''
  return items.map(k => k.relKeyword).join(', ')
}

export default function BlogKeywords({ onKeywordsChange }) {
  const [mainKw,    setMainKw]    = useState('')
  const [results,   setResults]   = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [selected,  setSelected]  = useState(new Set())
  const [maxAlert,  setMaxAlert]  = useState(false)

  const fetchKeywords = async () => {
    const main = mainKw.trim()
    if (!main) return
    setLoading(true); setError(''); setMaxAlert(false)
    try {
      const res  = await fetch(`/api/naver-keywords?keywords=${encodeURIComponent(main)}`)
      const data = await parseApiResponse(res, '/api/naver-keywords')

      const sorted = (data.keywordList || []).slice(0, 20).sort((a, b) =>
        (toNum(b.monthlyPcQcCnt) + toNum(b.monthlyMobileQcCnt)) -
        (toNum(a.monthlyPcQcCnt) + toNum(a.monthlyMobileQcCnt))
      )
      setResults(sorted)
      setSelected(new Set())           // 아무것도 선택 안 된 상태로 시작
      onKeywordsChange?.('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const toggle = kw => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(kw)) {
        next.delete(kw)
        setMaxAlert(false)
      } else {
        if (next.size >= MAX_SEL) {
          setMaxAlert(true)
          setTimeout(() => setMaxAlert(false), 2500)
          return prev
        }
        next.add(kw)
        setMaxAlert(false)
      }
      onKeywordsChange?.(buildContext(results || [], next))
      return next
    })
  }

  const onKey = e => { if (e.key === 'Enter') fetchKeywords() }

  return (
    <div style={{ marginBottom: 10 }}>
      {/* 입력 행 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: C.mu, display: 'block', marginBottom: 3 }}>관련 키워드 검색</label>
          <input
            value={mainKw} onChange={e => setMainKw(e.target.value)} onKeyDown={onKey}
            placeholder="예: 냉감 베개"
            style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: `1.5px solid ${C.bd}`, borderRadius: 9, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <button
          onClick={fetchKeywords} disabled={loading || !mainKw.trim()}
          style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: (mainKw.trim() && !loading) ? BLOG_COL : C.alt, color: (mainKw.trim() && !loading) ? '#fff' : C.fa, fontSize: 12, fontWeight: 700, cursor: (mainKw.trim() && !loading) ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {loading ? '조회 중…' : '관련키워드 보기'}
        </button>
      </div>

      {error && (
        <div style={{ fontSize: 11, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, padding: '6px 10px', marginTop: 8 }}>{error}</div>
      )}

      {/* 결과 테이블 */}
      {results && (
        <div style={{ marginTop: 10 }}>
          {/* 안내 문구 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: C.mu }}>
              최대 {MAX_SEL}개까지 선택하세요 · <strong style={{ color: BLOG_COL }}>{selected.size}/{MAX_SEL}</strong>개 선택됨
            </span>
            <span style={{ fontSize: 10, color: C.fa }}>{results.length}개 키워드</span>
          </div>

          {/* 초과 선택 토스트 */}
          {maxAlert && (
            <div style={{ fontSize: 11, color: '#d97706', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 7, padding: '6px 10px', marginBottom: 6, fontWeight: 600 }}>
              최대 {MAX_SEL}개까지만 선택할 수 있습니다
            </div>
          )}

          <div style={{ border: `1px solid ${C.bd}`, borderRadius: 9, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: C.alt }}>
                  <th style={{ width: 28, padding: '6px 8px' }} />
                  <th style={{ padding: '6px 10px', textAlign: 'left', color: C.mu, fontWeight: 700 }}>키워드</th>
                  <th style={{ padding: '6px 10px', textAlign: 'right', color: C.mu, fontWeight: 700, width: 72 }}>PC</th>
                  <th style={{ padding: '6px 10px', textAlign: 'right', color: C.mu, fontWeight: 700, width: 80 }}>모바일</th>
                  <th style={{ padding: '6px 10px', textAlign: 'right', color: C.mu, fontWeight: 700, width: 72 }}>합계</th>
                </tr>
              </thead>
              <tbody>
                {results.map((k, i) => {
                  const pc  = toNum(k.monthlyPcQcCnt)
                  const mob = toNum(k.monthlyMobileQcCnt)
                  const tot = pc + mob
                  const on  = selected.has(k.relKeyword)
                  const maxed = !on && selected.size >= MAX_SEL
                  return (
                    <tr key={i} onClick={() => toggle(k.relKeyword)}
                      style={{ cursor: 'pointer', background: on ? BLOG_LI : i % 2 === 0 ? C.sur : C.alt, borderTop: `1px solid ${C.bd}`, opacity: maxed ? 0.45 : 1 }}>
                      <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                        <input type="checkbox" checked={on} readOnly onClick={e => { e.stopPropagation(); toggle(k.relKeyword) }} style={{ cursor: 'pointer', accentColor: BLOG_COL }} />
                      </td>
                      <td style={{ padding: '5px 10px', color: on ? BLOG_COL : C.tx, fontWeight: on ? 700 : 400 }}>{k.relKeyword}</td>
                      <td style={{ padding: '5px 10px', textAlign: 'right', color: C.mu, fontFamily: 'monospace' }}>{fmt(k.monthlyPcQcCnt)}</td>
                      <td style={{ padding: '5px 10px', textAlign: 'right', color: C.mu, fontFamily: 'monospace' }}>{fmt(k.monthlyMobileQcCnt)}</td>
                      <td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace',
                        color: tot >= 10000 ? '#1D6B45' : tot >= 3000 ? BLOG_COL : C.tx }}>
                        {fmt(tot)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
