import React, { useEffect, useMemo, useRef, useState } from 'react'

const STORAGE_KEY = 'review_claim_collector_reviews'
const CLAIM_TYPES = [
  '배송/파손',
  '품질 문제',
  '맛/식감',
  '용량/크기',
  '보관 불편',
  '기대와 다름',
  '가격 불만',
  '기타',
]

const EMPTY_FORM = {
  itemName: '',
  vendorName: '',
  productUrl: '',
  rating: '5',
  reviewText: '',
  claimType: CLAIM_TYPES[0],
  memo: '',
}

const EMPTY_FILTERS = {
  itemName: '',
  vendorName: '',
  claimType: '',
  rating: '',
  keyword: '',
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function dateStamp() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}${mm}${dd}`
}

function escapeCsvCell(value) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function uniqueCount(rows, key) {
  return new Set(rows.map(row => row[key].trim()).filter(Boolean)).size
}

function getClaimCounts(rows) {
  return CLAIM_TYPES.map(type => ({
    type,
    count: rows.filter(row => row.claimType === type).length,
  }))
}

function StatCard({ label, value, sub }) {
  return (
    <section className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {sub && <small>{sub}</small>}
    </section>
  )
}

function Field({ label, children, required = false }) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <em>*</em>}
      </span>
      {children}
    </label>
  )
}

export default function App() {
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [expandedIds, setExpandedIds] = useState(() => new Set())
  const [restoreMode, setRestoreMode] = useState('append')
  const fileInputRef = useRef(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      if (Array.isArray(saved)) setReviews(saved)
    } catch {
      setReviews([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
  }, [reviews])

  const filteredReviews = useMemo(() => {
    const item = filters.itemName.trim().toLowerCase()
    const vendor = filters.vendorName.trim().toLowerCase()
    const keyword = filters.keyword.trim().toLowerCase()

    return reviews.filter(review => {
      const matchesItem = !item || review.itemName.toLowerCase().includes(item)
      const matchesVendor = !vendor || review.vendorName.toLowerCase().includes(vendor)
      const matchesType = !filters.claimType || review.claimType === filters.claimType
      const matchesRating = !filters.rating || String(review.rating) === filters.rating
      const searchTarget = `${review.reviewText} ${review.memo}`.toLowerCase()
      const matchesKeyword = !keyword || searchTarget.includes(keyword)
      return matchesItem && matchesVendor && matchesType && matchesRating && matchesKeyword
    })
  }, [filters, reviews])

  const stats = useMemo(() => {
    const counts = getClaimCounts(reviews)
    const topClaim = counts.reduce((top, current) => (current.count > top.count ? current : top), { type: '-', count: 0 })

    return {
      total: reviews.length,
      lowRatings: reviews.filter(review => Number(review.rating) <= 3).length,
      topClaim: topClaim.count ? `${topClaim.type} ${topClaim.count}건` : '-',
      items: uniqueCount(reviews, 'itemName'),
      vendors: uniqueCount(reviews, 'vendorName'),
    }
  }, [reviews])

  const claimCounts = useMemo(() => getClaimCounts(reviews), [reviews])
  const maxClaimCount = Math.max(1, ...claimCounts.map(row => row.count))

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }))

  const saveReview = event => {
    event.preventDefault()
    if (!form.itemName.trim() || !form.vendorName.trim() || !form.reviewText.trim()) return

    const nextReview = {
      id: createId(),
      createdAt: new Date().toISOString(),
      itemName: form.itemName.trim(),
      vendorName: form.vendorName.trim(),
      productUrl: form.productUrl.trim(),
      rating: Number(form.rating),
      reviewText: form.reviewText.trim(),
      claimType: form.claimType,
      memo: form.memo.trim(),
    }

    setReviews(prev => [nextReview, ...prev])
    setForm(EMPTY_FORM)
  }

  const deleteReview = id => {
    setReviews(prev => prev.filter(review => review.id !== id))
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const deleteAll = () => {
    if (window.confirm('전체 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setReviews([])
      setExpandedIds(new Set())
    }
  }

  const toggleExpanded = id => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const downloadCsv = () => {
    const headers = ['등록일', '품목명', '업체명', '별점', '클레임 분류', '후기 내용', '메모', '상품 URL']
    const rows = filteredReviews.map(review => [
      formatDateTime(review.createdAt),
      review.itemName,
      review.vendorName,
      `${review.rating}점`,
      review.claimType,
      review.reviewText,
      review.memo,
      review.productUrl,
    ])
    const csv = [headers, ...rows].map(row => row.map(escapeCsvCell).join(',')).join('\n')
    downloadFile(`review-claims-${dateStamp()}.csv`, `\uFEFF${csv}`, 'text/csv;charset=utf-8')
  }

  const exportJson = () => {
    downloadFile(`review-claims-backup-${dateStamp()}.json`, JSON.stringify(reviews, null, 2), 'application/json;charset=utf-8')
  }

  const importJson = async event => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      if (!Array.isArray(parsed)) throw new Error('array')

      const restored = parsed.map(row => ({
        id: row.id || createId(),
        createdAt: row.createdAt || new Date().toISOString(),
        itemName: String(row.itemName || ''),
        vendorName: String(row.vendorName || ''),
        productUrl: String(row.productUrl || ''),
        rating: Number(row.rating || 5),
        reviewText: String(row.reviewText || ''),
        claimType: CLAIM_TYPES.includes(row.claimType) ? row.claimType : '기타',
        memo: String(row.memo || ''),
      }))

      setReviews(prev => (restoreMode === 'replace' ? restored : [...restored, ...prev]))
      window.alert(`${restored.length}건을 불러왔습니다.`)
    } catch {
      window.alert('JSON 파일 형식이 올바르지 않습니다.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app-shell">
        <header className="page-header">
          <div>
            <p className="eyebrow">Review Claim Collector</p>
            <h1>리뷰 클레임 수집기</h1>
            <p>경쟁사 후기를 모아 클레임 대응 매뉴얼과 상세페이지 개선에 활용하세요.</p>
          </div>
        </header>

        <main>
          <section className="stats-grid" aria-label="통계 요약">
            <StatCard label="전체 후기 수" value={`${stats.total}건`} />
            <StatCard label="별점 1~3점" value={`${stats.lowRatings}건`} sub="주의 리뷰" />
            <StatCard label="최다 클레임" value={stats.topClaim} />
            <StatCard label="품목 수" value={`${stats.items}개`} />
            <StatCard label="업체 수" value={`${stats.vendors}개`} />
          </section>

          <div className="workspace-grid">
            <section className="panel form-panel">
              <div className="panel-title">
                <div>
                  <h2>후기 등록</h2>
                  <p>자동 크롤링 없이, 복사한 리뷰를 직접 붙여넣어 저장합니다.</p>
                </div>
              </div>

              <form onSubmit={saveReview} className="review-form">
                <div className="two-cols">
                  <Field label="품목명" required>
                    <input value={form.itemName} onChange={e => updateForm('itemName', e.target.value)} placeholder="예: 김치, 사과즙, 냉동만두" />
                  </Field>
                  <Field label="업체명" required>
                    <input value={form.vendorName} onChange={e => updateForm('vendorName', e.target.value)} placeholder="예: 네이버 스마트스토어 업체명" />
                  </Field>
                </div>

                <Field label="상품 URL">
                  <input value={form.productUrl} onChange={e => updateForm('productUrl', e.target.value)} placeholder="https://..." />
                </Field>

                <div className="two-cols">
                  <Field label="별점">
                    <select value={form.rating} onChange={e => updateForm('rating', e.target.value)}>
                      {[1, 2, 3, 4, 5].map(score => <option key={score} value={score}>{score}점</option>)}
                    </select>
                  </Field>
                  <Field label="클레임 분류">
                    <select value={form.claimType} onChange={e => updateForm('claimType', e.target.value)}>
                      {CLAIM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="후기 내용" required>
                  <textarea value={form.reviewText} onChange={e => updateForm('reviewText', e.target.value)} rows={7} placeholder="사용자가 복사한 상품 후기를 붙여넣으세요." />
                </Field>

                <Field label="관리자 메모">
                  <textarea value={form.memo} onChange={e => updateForm('memo', e.target.value)} rows={4} placeholder="대응 방향, 상세페이지 개선 포인트 등을 적어두세요." />
                </Field>

                <button className="primary-button" type="submit">후기 저장</button>
              </form>
            </section>

            <aside className="panel summary-panel">
              <div className="panel-title">
                <div>
                  <h2>클레임 분류별 집계</h2>
                  <p>전체 저장 데이터 기준</p>
                </div>
              </div>
              <div className="claim-bars">
                {claimCounts.map(row => (
                  <div className="claim-bar-row" key={row.type}>
                    <div className="claim-label">
                      <span>{row.type}</span>
                      <strong>{row.count}건</strong>
                    </div>
                    <div className="bar-track">
                      <div style={{ width: `${(row.count / maxClaimCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="backup-box">
                <h3>데이터 백업/복원</h3>
                <button type="button" className="secondary-button" onClick={exportJson}>JSON 내보내기</button>
                <div className="restore-controls">
                  <select value={restoreMode} onChange={e => setRestoreMode(e.target.value)} aria-label="복원 방식">
                    <option value="append">기존 데이터에 추가</option>
                    <option value="replace">기존 데이터 덮어쓰기</option>
                  </select>
                  <button type="button" className="secondary-button" onClick={() => fileInputRef.current?.click()}>JSON 불러오기</button>
                  <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={importJson} />
                </div>
                <button type="button" className="danger-button" onClick={deleteAll} disabled={!reviews.length}>전체 데이터 삭제</button>
              </div>
            </aside>
          </div>

          <section className="panel table-panel">
            <div className="panel-title table-title">
              <div>
                <h2>후기 목록</h2>
                <p>현재 필터 결과 {filteredReviews.length}건</p>
              </div>
              <button type="button" className="primary-button compact" onClick={downloadCsv} disabled={!filteredReviews.length}>CSV 다운로드</button>
            </div>

            <div className="filters">
              <input value={filters.itemName} onChange={e => updateFilter('itemName', e.target.value)} placeholder="품목명 검색" />
              <input value={filters.vendorName} onChange={e => updateFilter('vendorName', e.target.value)} placeholder="업체명 검색" />
              <select value={filters.claimType} onChange={e => updateFilter('claimType', e.target.value)}>
                <option value="">클레임 전체</option>
                {CLAIM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <select value={filters.rating} onChange={e => updateFilter('rating', e.target.value)}>
                <option value="">별점 전체</option>
                {[1, 2, 3, 4, 5].map(score => <option key={score} value={score}>{score}점</option>)}
              </select>
              <input value={filters.keyword} onChange={e => updateFilter('keyword', e.target.value)} placeholder="후기/메모 키워드" />
              <button type="button" className="secondary-button" onClick={() => setFilters(EMPTY_FILTERS)}>필터 초기화</button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>등록일</th>
                    <th>품목명</th>
                    <th>업체명</th>
                    <th>별점</th>
                    <th>클레임 분류</th>
                    <th>후기 내용</th>
                    <th>메모</th>
                    <th>상품 URL</th>
                    <th>삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="empty-cell">저장된 후기 또는 필터 결과가 없습니다.</td>
                    </tr>
                  ) : filteredReviews.map(review => {
                    const expanded = expandedIds.has(review.id)
                    return (
                      <tr key={review.id}>
                        <td>{formatDateTime(review.createdAt)}</td>
                        <td><strong>{review.itemName}</strong></td>
                        <td>{review.vendorName}</td>
                        <td><span className="rating">{review.rating}점</span></td>
                        <td><span className="claim-chip">{review.claimType}</span></td>
                        <td>
                          <button type="button" className={`text-toggle ${expanded ? 'expanded' : ''}`} onClick={() => toggleExpanded(review.id)}>
                            {review.reviewText}
                          </button>
                        </td>
                        <td>
                          <button type="button" className={`text-toggle ${expanded ? 'expanded' : ''}`} onClick={() => toggleExpanded(review.id)}>
                            {review.memo || '-'}
                          </button>
                        </td>
                        <td>
                          {review.productUrl ? <a href={review.productUrl} target="_blank" rel="noreferrer">열기</a> : '-'}
                        </td>
                        <td>
                          <button type="button" className="delete-button" onClick={() => deleteReview(review.id)}>삭제</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}

const styles = `
:root {
  color: #172033;
  background: #f4f6f9;
  font-family: "Noto Sans KR", "Apple SD Gothic Neo", system-ui, sans-serif;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  min-width: 320px;
  background: #f4f6f9;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  border: 0;
}

.app-shell {
  min-height: 100vh;
  background: #f4f6f9;
}

.page-header {
  background: #ffffff;
  border-bottom: 1px solid #dce2ea;
  padding: 32px 24px;
}

.page-header > div,
main {
  width: min(1440px, calc(100% - 40px));
  margin: 0 auto;
}

.eyebrow {
  margin: 0 0 8px;
  color: #315475;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #0f2744;
  font-size: 32px;
  line-height: 1.25;
}

.page-header p:last-child,
.panel-title p {
  margin: 8px 0 0;
  color: #667487;
  line-height: 1.6;
}

main {
  padding: 24px 0 52px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.stat-card,
.panel {
  background: #ffffff;
  border: 1px solid #dce2ea;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 39, 68, 0.05);
}

.stat-card {
  padding: 18px;
  min-height: 112px;
}

.stat-card span,
.stat-card small {
  display: block;
  color: #667487;
  font-size: 13px;
}

.stat-card strong {
  display: block;
  margin-top: 10px;
  color: #0f2744;
  font-size: 24px;
  line-height: 1.25;
}

.stat-card small {
  margin-top: 4px;
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.75fr);
  gap: 18px;
  align-items: start;
}

.panel {
  padding: 22px;
}

.panel-title {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
}

h2,
h3 {
  margin: 0;
  color: #0f2744;
}

h2 {
  font-size: 20px;
}

h3 {
  font-size: 16px;
}

.review-form,
.claim-bars,
.backup-box,
.filters {
  display: grid;
  gap: 14px;
}

.two-cols {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.field {
  display: grid;
  gap: 7px;
}

.field span {
  color: #26384f;
  font-size: 14px;
  font-weight: 700;
}

.field em {
  margin-left: 3px;
  color: #dc2626;
  font-style: normal;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid #cfd7e3;
  border-radius: 8px;
  background: #f8fafc;
  color: #172033;
  outline: none;
  padding: 11px 12px;
}

textarea {
  resize: vertical;
  line-height: 1.65;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #183a5a;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(24, 58, 90, 0.1);
}

.primary-button,
.secondary-button,
.danger-button,
.delete-button {
  border-radius: 8px;
  cursor: pointer;
  font-weight: 800;
  transition: opacity .15s, transform .15s, background .15s;
}

.primary-button {
  min-height: 46px;
  background: #102a46;
  color: #ffffff;
  padding: 0 18px;
}

.primary-button.compact {
  min-height: 40px;
  white-space: nowrap;
}

.secondary-button {
  min-height: 42px;
  border: 1px solid #c8d2df;
  background: #eef2f6;
  color: #213a56;
  padding: 0 14px;
}

.danger-button {
  min-height: 42px;
  background: #fff1f2;
  color: #be123c;
  padding: 0 14px;
}

.delete-button {
  min-height: 34px;
  background: #fff1f2;
  color: #be123c;
  padding: 0 10px;
}

button:disabled {
  cursor: not-allowed;
  opacity: .45;
}

button:not(:disabled):hover {
  transform: translateY(-1px);
}

.claim-bar-row {
  display: grid;
  gap: 7px;
}

.claim-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #26384f;
  font-size: 14px;
}

.bar-track {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #e7ebf0;
}

.bar-track div {
  height: 100%;
  min-width: 0;
  border-radius: inherit;
  background: #17375c;
}

.backup-box {
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid #dce2ea;
}

.restore-controls {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

input[type="file"] {
  display: none;
}

.table-panel {
  margin-top: 18px;
}

.table-title {
  align-items: center;
}

.filters {
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin-bottom: 16px;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid #dce2ea;
  border-radius: 8px;
}

table {
  width: 100%;
  min-width: 1180px;
  border-collapse: collapse;
  background: #ffffff;
}

th,
td {
  border-bottom: 1px solid #e8edf3;
  padding: 13px 12px;
  text-align: left;
  vertical-align: top;
  font-size: 14px;
}

th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f1f4f8;
  color: #30445d;
  font-size: 13px;
  font-weight: 800;
}

tr:last-child td {
  border-bottom: 0;
}

a {
  color: #0f4f8a;
  font-weight: 800;
}

.rating,
.claim-chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  border-radius: 999px;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.rating {
  background: #eef2ff;
  color: #263e89;
}

.claim-chip {
  background: #edf4f7;
  color: #17375c;
}

.text-toggle {
  width: 100%;
  max-width: 360px;
  padding: 0;
  background: transparent;
  color: #26384f;
  text-align: left;
  line-height: 1.55;
  cursor: pointer;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.text-toggle.expanded {
  display: block;
  max-width: 560px;
  white-space: pre-wrap;
}

.empty-cell {
  padding: 42px 12px;
  color: #667487;
  text-align: center;
}

@media (max-width: 1180px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .page-header {
    padding: 24px 16px;
  }

  .page-header > div,
  main {
    width: min(100% - 28px, 1440px);
  }

  h1 {
    font-size: 26px;
  }

  .stats-grid,
  .two-cols,
  .filters,
  .restore-controls {
    grid-template-columns: 1fr;
  }

  .panel {
    padding: 18px;
  }

  .table-title {
    align-items: stretch;
    flex-direction: column;
  }
}
`
