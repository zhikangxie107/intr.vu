'use client';
import { useMemo } from 'react';

export default function ReviewModal({ open, onClose, reviewPayload }) {
  if (!open) return null;

  const review = reviewPayload?.review || {};
  const overall = review?.overall ?? 'N/A';
  const categories = Array.isArray(review?.categories) ? review.categories : [];
  const strengths = Array.isArray(review?.strengths) ? review.strengths : [];
  const issues = Array.isArray(review?.issues) ? review.issues : [];
  const recommendations = Array.isArray(review?.recommendations) ? review.recommendations : [];
  const summary = review?.summary || '';

  const question = reviewPayload?.question ?? '';
  const sessionId = reviewPayload?.sessionId ?? '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(reviewPayload, null, 2));
      alert('Review JSON copied to clipboard.');
    } catch {/* no-op */}
  };

  const scoreColor = useMemo(() => {
    const n = Number(overall);
    if (Number.isNaN(n)) return '#64748b';
    if (n >= 8.5) return '#16a34a';
    if (n >= 6.5) return '#f59e0b';
    return '#ef4444';
  }, [overall]);

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="rvw-title">
        <div className="modal-header">
          <div>
            <div className="eyebrow">Session Review</div>
            <h2 id="rvw-title" className="title">
              {question || 'Interview'} — <span className="muted">#{sessionId?.slice(0, 6) || '—'}</span>
            </h2>
          </div>
          <button className="close" onClick={onClose} aria-label="Close review">✕</button>
        </div>

        <section className="overall">
          <div className="overall-score" style={{ borderColor: scoreColor, color: scoreColor }}>
            <div className="score-num">{overall}</div>
            <div className="score-outof">/ 10</div>
          </div>
          {summary && <p className="summary">{summary}</p>}
        </section>

        {!!categories.length && (
          <section className="section">
            <h3 className="section-title">Category Scores</h3>
            <div className="cats">
              {categories.map((c, i) => {
                const s = Math.max(0, Math.min(10, Number(c?.score ?? 0)));
                const pct = (s / 10) * 100;
                return (
                  <div className="cat" key={`${c?.name || i}`}>
                    <div className="cat-top">
                      <div className="cat-name">{c?.name || `Category ${i + 1}`}</div>
                      <div className="cat-score">{!Number.isNaN(s) ? s.toFixed(1) : '—'}/10</div>
                    </div>
                    <div className="bar"><div className="fill" style={{ width: `${pct}%` }} /></div>
                    {c?.rationale && <div className="rationale">{c.rationale}</div>}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {(strengths.length || issues.length) ? (
          <section className="grid2">
            {!!strengths.length && (
              <div className="card">
                <h3 className="section-title">Strengths</h3>
                <ul className="list">{strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {!!issues.length && (
              <div className="card">
                <h3 className="section-title">Issues</h3>
                <ul className="list">{issues.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
          </section>
        ) : null}

        {!!recommendations.length && (
          <section className="section">
            <h3 className="section-title">Recommendations</h3>
            <div className="recs">
              {recommendations.map((r, i) => (
                <div className="rec" key={i}>
                  <span className={`badge ${r?.priority || 'low'}`}>{(r?.priority || 'low').toUpperCase()}</span>
                  <span className="rec-text">{r?.action || ''}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="footer">
          <button className="secondary" onClick={handleCopy}>Copy JSON</button>
          <button className="primary" onClick={onClose}>Close</button>
        </div>
      </div>

      <style jsx>{`
        .modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,.45); backdrop-filter: blur(2px); z-index: 60; }
        .modal { position: fixed; inset: 0; margin: auto; width: min(980px, 92vw); max-height: 88vh; background: #fff; border-radius: 16px; overflow: auto; box-shadow: 0 20px 60px rgba(0,0,0,.2); z-index: 70; display: grid; grid-template-rows: auto auto 1fr auto; padding: 16px 18px 14px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 6px 4px 10px; border-bottom: 1px solid #eef2f7; }
        .eyebrow { font-size: 12px; letter-spacing: .08em; color: #64748b; font-weight: 700; text-transform: uppercase; }
        .title { margin: 2px 0 0; font-size: 20px; color: #0f172a; }
        .muted { color: #94a3b8; font-weight: 600; }
        .close { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; width: 36px; height: 36px; cursor: pointer; font-weight: 700; }
        .overall { display: grid; grid-template-columns: 140px 1fr; gap: 14px; align-items: center; padding: 14px 4px; border-bottom: 1px solid #eef2f7; }
        .overall-score { border: 2px solid; border-radius: 12px; display: grid; place-items: center; padding: 10px 8px; }
        .score-num { font-size: 38px; line-height: 1; font-weight: 800; }
        .score-outof { font-size: 14px; margin-top: 4px; color: #334155; font-weight: 700; }
        .summary { margin: 0; color: #0f172a; font-size: 15px; line-height: 1.4; }
        .section { padding: 14px 4px; }
        .section-title { margin: 0 0 10px; font-size: 16px; color: #0f172a; font-weight: 800; }
        .cats { display: grid; gap: 12px; }
        .cat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; }
        .cat-top { display: flex; justify-content: space-between; align-items: baseline; }
        .cat-name { font-weight: 700; color: #0f172a; }
        .cat-score { font-weight: 800; color: #334155; font-size: 13px; }
        .bar { height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; margin: 8px 0; }
        .fill { height: 100%; background: linear-gradient(90deg, #60a5fa, #34d399); }
        .rationale { color: #334155; font-size: 13px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 14px 4px; }
        .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
        .list { margin: 8px 0 0 18px; padding: 0; color: #0f172a; }
        .list li { margin: 6px 0; }
        .recs { display: grid; gap: 10px; }
        .rec { display: grid; grid-template-columns: 110px 1fr; align-items: start; gap: 8px; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 800; color: #0f172a; background: #e2e8f0; border: 1px solid #cbd5e1; text-align: center; }
        .badge.high { color: #991b1b; background: #fee2e2; border-color: #fecaca; }
        .badge.medium { color: #92400e; background: #fef3c7; border-color: #fde68a; }
        .badge.low { color: #065f46; background: #d1fae5; border-color: #a7f3d0; }
        .rec-text { color: #0f172a; }
        .footer { display: flex; justify-content: flex-end; gap: 10px; padding: 10px 4px 2px; border-top: 1px solid #eef2f7; margin-top: 6px; }
        .primary { background: #111827; color: #fff; border: 1px solid #111827; border-radius: 10px; padding: 8px 12px; font-weight: 800; cursor: pointer; }
        .secondary { background: #fff; color: #111827; border: 1px solid #cbd5e1; border-radius: 10px; padding: 8px 12px; font-weight: 700; cursor: pointer; }
        @media (max-width: 840px) {
          .overall { grid-template-columns: 1fr; }
          .grid2 { grid-template-columns: 1fr; }
          .rec { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
