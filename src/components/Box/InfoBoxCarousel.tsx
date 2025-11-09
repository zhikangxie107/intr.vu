"use client";
import React, { useRef, useEffect, useState } from "react";
import styles from "./InfoBoxCarousel.module.css";

/**
 * Props:
 * - className?: string
 * - showDots?: boolean (default true)
 * - gap?: number (px, default 12)
 */
export default function InfoBoxCarousel({
  children,
  className = "",
  showDots = true,
  gap = 12,
}) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const items = React.Children.toArray(children);
  const count = items.length;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.style.setProperty("--gap", `${gap}px`);

    const onScroll = () => {
      const first = el.querySelector(`.${styles.slide}`);
      if (!first) return;
      const itemWidth = first.getBoundingClientRect().width + gap;
      const i = Math.round(el.scrollLeft / itemWidth);
      setIndex(Math.max(0, Math.min(count - 1, i)));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [count, gap]);

  const scrollByItems = (delta) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.querySelector(`.${styles.slide}`);
    if (!first) return;
    const itemWidth = first.getBoundingClientRect().width + gap;
    el.scrollBy({ left: delta * itemWidth, behavior: "smooth" });
  };

  return (
    <div
      className={`${styles.carousel} ${className}`}
      tabIndex={0}
      aria-roledescription="carousel"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") scrollByItems(1);
        if (e.key === "ArrowLeft") scrollByItems(-1);
      }}
    >
      <div className={styles.viewport} ref={trackRef}>
        {items.map((child, i) => (
          <div className={styles.slide} key={i} aria-roledescription="slide">
            {child}
          </div>
        ))}
      </div>

      {showDots && (
        <div className={styles.dots} role="tablist" aria-label="Carousel Pagination">
          {items.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              aria-selected={i === index}
              role="tab"
              onClick={() => {
                const el = trackRef.current;
                const first = el?.querySelector(`.${styles.slide}`);
                if (!el || !first) return;
                const itemWidth = first.getBoundingClientRect().width + gap;
                el.scrollTo({ left: i * itemWidth, behavior: "smooth" });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
