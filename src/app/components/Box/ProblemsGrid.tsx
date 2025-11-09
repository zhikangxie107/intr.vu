"use client";
import React, { useState, useMemo } from "react";
import styles from "./ProblemsGrid.module.css";

/**
 * Props:
 * - items: Array<{
 *     id: string | number,
 *     title: string,
 *     tag?: string,
 *     duration?: string,
 *     likes?: number,
 *     difficulty?: "Beginner" | "Intermediate" | "Advanced" | string,
 *     startHref: string
 *   }>
 * - initialCount?: number   // how many to show at first (default 20)
 * - pageSize?: number       // how many to add per "Show more" click (default 20)
 * - renderItem?: (item) => ReactNode  // optional custom renderer; defaults to a simple card
 */
export default function ProblemsGrid({
  items = [],
  initialCount = 32,
  pageSize = 32,
  renderItem,
}) {
  const [visible, setVisible] = useState(initialCount);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("none"); // "none" | "asc" | "desc"

  const difficultyRank = (d) => {
    const m = { beginner: 0, intermediate: 1, advanced: 2 };
    if (!d) return 99;
    return m[String(d).toLowerCase()] ?? 99;
  };

  const processed = useMemo(() => {
    // 1) filter by search query (title or tag)
    const q = query.trim().toLowerCase();
    let next = !q
      ? items
      : items.filter((it) => {
          const title = (it.title ?? "").toLowerCase();
          const tag = (it.tag ?? "").toLowerCase();
          return title.includes(q) || tag.includes(q);
        });

    // 2) sort by difficulty if selected
    if (sortMode !== "none") {
      const dir = sortMode === "asc" ? 1 : -1;
      next = [...next].sort((a, b) => {
        const ra = difficultyRank(a.difficulty);
        const rb = difficultyRank(b.difficulty);
        if (ra === rb) return 0;
        return ra < rb ? dir * -1 : dir * 1;
      });
    }

    return next;
  }, [items, query, sortMode]);

  const visibleItems = useMemo(
    () => processed.slice(0, visible),
    [processed, visible]
  );
  const canShowMore = visible < processed.length;

  // Reset pagination when filters change
  React.useEffect(() => {
    setVisible(initialCount);
  }, [query, sortMode, initialCount]);

  return (
    <section className={styles.wrapper}>
      {/* Top-right controls */}
      <div className={styles.toolbar} aria-label="Search and sort controls">
        <input
          className={styles.search}
          type="search"
          placeholder="Search problems…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search problems"
        />
        <select
          className={styles.sort}
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
          aria-label="Sort by difficulty"
        >
          <option value="none">Sort: None</option>
          <option value="asc">Difficulty: Easy → Hard</option>
          <option value="desc">Difficulty: Hard → Easy</option>
        </select>
      </div>

      <div className={styles.grid}>
        {visibleItems.map((item) =>
          renderItem ? (
            <div key={item.id} className={styles.cell}>
              {renderItem(item)}
            </div>
          ) : (
            <div key={item.id} className={styles.cell}>
              <DefaultProblemCard item={item} />
            </div>
          )
        )}
      </div>

      {canShowMore && (
        <div className={styles.controls}>
          <button
            className={styles.moreBtn}
            onClick={() =>
              setVisible((v) => Math.min(v + pageSize, processed.length))
            }
          >
            Show more
          </button>
        </div>
      )}
    </section>
  );
}

/** Minimal default card if you don't pass renderItem */
function DefaultProblemCard({ item }) {
  const { title, tag, duration, likes, difficulty, startHref } = item;
  return (
    <article className={styles.card} aria-label={`Problem: ${title}`}>
      <h3 className={styles.title} title={title}>
        {title}
      </h3>

      <div className={styles.bottom}>
        <div className={styles.left}>
          {difficulty && (
            <span
              className={`${styles.pill} ${
                styles[difficulty?.toLowerCase()] || ""
              }`}
            >
              {difficulty}
            </span>
          )}
          {tag && <span className={styles.pill}>{tag}</span>}
          {duration && <span className={styles.meta}>{duration}</span>}
          {typeof likes !== "undefined" && (
            <span className={styles.meta} aria-label={`${likes} likes`}>
              <svg className={styles.heart} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s-7.5-4.35-10-8.88C.38 9.2 2.12 5.5 5.6 5.5c2.02 0 3.4 1.36 4.4 2.64 1-1.28 2.38-2.64 4.4-2.64 3.48 0 5.22 3.7 3.6 6.62C19.5 16.65 12 21 12 21z"/>
              </svg>
              {likes}
            </span>
          )}
        </div>
        <a
          className={styles.start}
          href={startHref}
          target={startHref?.startsWith("http") ? "_blank" : undefined}
          rel={startHref?.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          Start
        </a>
      </div>
    </article>
  );
}
