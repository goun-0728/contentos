"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type Review = {
  itemName: string;
  vendorName: string;
  productUrl: string;
  reviewText: string;
  collectedAt: string;
  source: string;
};

const STORAGE_KEY = "extension_review_claims";

function makeKey(review: Review) {
  return [
    review.itemName,
    review.vendorName,
    review.productUrl,
    review.reviewText,
    review.source,
  ].join("|").toLowerCase();
}

function normalizeReview(raw: Partial<Review>): Review {
  return {
    itemName: String(raw.itemName || "").trim(),
    vendorName: String(raw.vendorName || "").trim(),
    productUrl: String(raw.productUrl || "").trim(),
    reviewText: String(raw.reviewText || "").replace(/\s+/g, " ").trim(),
    collectedAt: raw.collectedAt || new Date().toISOString(),
    source: raw.source || "naver-smartstore",
  };
}

function dateStamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value || "";
  }
}

export default function ReviewCollectorPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState("저장된 리뷰를 불러오는 중입니다.");
  const [pasteText, setPasteText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const saved = loadStoredReviews();
    const imported = importFromHash();
    const nextReviews = imported.length ? mergeReviews(imported, saved) : saved;

    setReviews(nextReviews);
    persistReviews(nextReviews);
    setStatus(imported.length ? `확장프로그램에서 ${imported.length}건을 가져왔습니다.` : "확장프로그램 JSON 업로드 또는 붙여넣기를 기다리는 중입니다.");
  }, []);

  const stats = useMemo(() => {
    return {
      total: reviews.length,
      items: new Set(reviews.map(review => review.itemName).filter(Boolean)).size,
      vendors: new Set(reviews.map(review => review.vendorName).filter(Boolean)).size,
    };
  }, [reviews]);

  function loadStoredReviews() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.map(normalizeReview).filter(review => review.reviewText.length >= 10) : [];
    } catch {
      return [];
    }
  }

  function importFromHash() {
    try {
      const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
      const payload = new URLSearchParams(hash).get("reviews");
      if (!payload) return [];

      const parsed = JSON.parse(decodeURIComponent(payload));
      window.history.replaceState(null, "", window.location.pathname);
      return Array.isArray(parsed) ? parsed.map(normalizeReview).filter(review => review.reviewText.length >= 10) : [];
    } catch {
      setStatus("확장프로그램 전달 데이터를 읽지 못했습니다. JSON 파일 업로드를 사용해주세요.");
      return [];
    }
  }

  function persistReviews(nextReviews: Review[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextReviews));
  }

  function mergeReviews(incoming: Review[], current = reviews) {
    const existing = new Set(current.map(makeKey));
    const accepted: Review[] = [];

    for (const raw of incoming) {
      const review = normalizeReview(raw);
      if (review.reviewText.length < 10) continue;

      const key = makeKey(review);
      if (existing.has(key)) continue;

      existing.add(key);
      accepted.push(review);
    }

    return [...accepted, ...current];
  }

  function addReviews(incoming: Review[]) {
    const nextReviews = mergeReviews(incoming);
    const added = nextReviews.length - reviews.length;
    setReviews(nextReviews);
    persistReviews(nextReviews);
    setStatus(added ? `새 리뷰 ${added}건을 저장했습니다.` : "새로 추가된 리뷰가 없습니다.");
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      const rows = Array.isArray(parsed) ? parsed : parsed.reviews;
      if (!Array.isArray(rows)) throw new Error("invalid");
      addReviews(rows.map(normalizeReview));
    } catch {
      setStatus("JSON 파일 형식이 올바르지 않습니다.");
    } finally {
      event.target.value = "";
    }
  }

  function importPastedJson() {
    try {
      const parsed = JSON.parse(pasteText);
      const rows = Array.isArray(parsed) ? parsed : parsed.reviews;
      if (!Array.isArray(rows)) throw new Error("invalid");
      addReviews(rows.map(normalizeReview));
      setPasteText("");
    } catch {
      setStatus("붙여넣은 JSON 형식이 올바르지 않습니다.");
    }
  }

  function downloadCsv() {
    const headers = ["수집일시", "품목명", "업체명", "상품URL", "리뷰내용", "출처"];
    const rows = reviews.map(review => [
      review.collectedAt,
      review.itemName,
      review.vendorName,
      review.productUrl,
      review.reviewText,
      review.source,
    ]);
    const csv = [headers, ...rows].map(row => row.map(csvCell).join(",")).join("\n");
    downloadFile(`review-claims-${dateStamp()}.csv`, `\uFEFF${csv}`, "text/csv;charset=utf-8");
  }

  function downloadJson() {
    downloadFile(`review-claims-${dateStamp()}.json`, JSON.stringify({ reviews }, null, 2), "application/json;charset=utf-8");
  }

  function clearAll() {
    if (!window.confirm("저장된 리뷰를 모두 삭제하시겠습니까?")) return;
    setReviews([]);
    persistReviews([]);
    setStatus("전체 데이터를 삭제했습니다.");
  }

  return (
    <main className="reviewCollectorPage">
      <style jsx>{`
        .reviewCollectorPage {
          width: min(1180px, calc(100% - 36px));
          margin: 0 auto;
          padding: 34px 0 64px;
          color: #172033;
        }

        .hero {
          margin-bottom: 22px;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #315475;
          font-size: 12px;
          font-weight: 800;
        }

        h1,
        h2 {
          margin: 0;
          color: #0f2744;
        }

        h1 {
          font-size: 32px;
          line-height: 1.25;
        }

        .hero p,
        .panel p,
        .status {
          color: #667487;
          line-height: 1.65;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin: 18px 0;
        }

        .stat,
        .panel {
          border: 1px solid #dce2ea;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 8px 24px rgba(15, 39, 68, 0.05);
        }

        .stat {
          padding: 16px;
        }

        .stat span {
          display: block;
          color: #667487;
          font-size: 13px;
          font-weight: 700;
        }

        .stat strong {
          display: block;
          margin-top: 8px;
          color: #0f2744;
          font-size: 24px;
        }

        .panel {
          margin-top: 16px;
          padding: 20px;
        }

        .toolbar,
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        button {
          min-height: 40px;
          border: 0;
          border-radius: 8px;
          background: #102a46;
          color: #fff;
          padding: 0 14px;
          cursor: pointer;
          font: inherit;
          font-weight: 800;
        }

        button.secondary {
          border: 1px solid #c8d2df;
          background: #eef2f6;
          color: #213a56;
        }

        button.danger {
          background: #fff1f2;
          color: #be123c;
        }

        textarea {
          width: 100%;
          min-height: 130px;
          margin-top: 10px;
          border: 1px solid #cfd7e3;
          border-radius: 8px;
          padding: 12px;
          font: inherit;
          resize: vertical;
        }

        .tableWrap {
          margin-top: 14px;
          overflow-x: auto;
          border: 1px solid #dce2ea;
          border-radius: 8px;
        }

        table {
          width: 100%;
          min-width: 980px;
          border-collapse: collapse;
        }

        th,
        td {
          border-bottom: 1px solid #e8edf3;
          padding: 12px;
          text-align: left;
          vertical-align: top;
          font-size: 14px;
        }

        th {
          background: #f1f4f8;
          color: #30445d;
          font-size: 13px;
        }

        .reviewText {
          max-width: 460px;
          line-height: 1.55;
          word-break: break-word;
        }

        .empty {
          padding: 38px 12px;
          text-align: center;
          color: #667487;
        }

        @media (max-width: 760px) {
          .stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="hero">
        <p className="eyebrow">Vercel Review Collector</p>
        <h1>리뷰 클레임 수집기</h1>
        <p>확장프로그램에서 내보낸 리뷰 JSON을 브라우저 localStorage에 저장하고 CSV로 다운로드합니다.</p>
      </section>

      <section className="stats">
        <div className="stat"><span>전체 리뷰</span><strong>{stats.total}건</strong></div>
        <div className="stat"><span>품목 수</span><strong>{stats.items}개</strong></div>
        <div className="stat"><span>업체 수</span><strong>{stats.vendors}개</strong></div>
      </section>

      <section className="panel">
        <h2>확장프로그램 데이터 가져오기</h2>
        <p className="status">{status}</p>
        <div className="toolbar">
          <button type="button" onClick={() => fileInputRef.current?.click()}>JSON 업로드</button>
          <button type="button" className="secondary" onClick={importPastedJson}>붙여넣기 가져오기</button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFile} hidden />
        </div>
        <textarea
          value={pasteText}
          onChange={event => setPasteText(event.target.value)}
          placeholder='확장프로그램에서 다운로드한 JSON 내용을 붙여넣으세요. 예: {"reviews":[...]}'
        />
      </section>

      <section className="panel">
        <div className="actions">
          <button type="button" onClick={downloadCsv} disabled={!reviews.length}>CSV 다운로드</button>
          <button type="button" className="secondary" onClick={downloadJson} disabled={!reviews.length}>JSON 백업</button>
          <button type="button" className="danger" onClick={clearAll} disabled={!reviews.length}>전체 삭제</button>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>수집일시</th>
                <th>품목명</th>
                <th>업체명</th>
                <th>상품URL</th>
                <th>리뷰내용</th>
                <th>출처</th>
              </tr>
            </thead>
            <tbody>
              {!reviews.length ? (
                <tr><td className="empty" colSpan={6}>저장된 리뷰가 없습니다.</td></tr>
              ) : reviews.map((review, index) => (
                <tr key={`${makeKey(review)}-${index}`}>
                  <td>{formatDate(review.collectedAt)}</td>
                  <td>{review.itemName || "-"}</td>
                  <td>{review.vendorName || "-"}</td>
                  <td>{review.productUrl ? <a href={review.productUrl} target="_blank" rel="noreferrer">열기</a> : "-"}</td>
                  <td className="reviewText">{review.reviewText}</td>
                  <td>{review.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
