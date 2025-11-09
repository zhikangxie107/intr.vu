import React from "react";
import s from "./FeaturedCourseCard.module.css";

/**
 * Props:
 * - title: string
 * - tag?: string            // e.g., "React"
 * - duration?: string       // e.g., "3h 20m"
 * - likes?: number | string // e.g., 2150
 * - difficulty?: "Beginner" | "Intermediate" | "Advanced" | string
 * - startHref: string       // external or internal link (e.g., YouTube)
 * - className?: string
 */ 
export default function FeaturedCourseCard({
  title,
  tag,
  duration,
  likes,
  difficulty,
  startHref,
  className = "",
}) {
  return (
    <article className={`${s.card} ${className}`} aria-label={`Course: ${title}`}>
      <h3 className={s.title}>{title}</h3>

      <div className={s.footer}>
        <div className={s.left}>
          {difficulty && (
            <span className={`${s.pill} ${s[difficulty.toLowerCase()] || ""}`}>
              {difficulty}
            </span>
          )}
          {tag && <span className={s.pill}>{tag}</span>}
          {duration && <span className={s.meta}>{duration}</span>}
          {likes !== undefined && (
            <span className={s.meta} aria-label={`${likes} likes`}>
              <svg className={s.heart} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s-7.5-4.35-10-8.88C.38 9.2 2.12 5.5 5.6 5.5c2.02 0 3.4 1.36 4.4 2.64 1-1.28 2.38-2.64 4.4-2.64 3.48 0 5.22 3.7 3.6 6.62C19.5 16.65 12 21 12 21z"/>
              </svg>
              {likes}
            </span>
          )}
        </div>

        <div className={s.right}>
          <a
            className={s.start}
            href={startHref}
            target={startHref?.startsWith("http") ? "_blank" : undefined}
            rel={startHref?.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            Start
          </a>
        </div>
      </div>
    </article>
  );
}
