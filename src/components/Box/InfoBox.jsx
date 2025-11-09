import React from "react";
import styles from "./InfoBox.module.css";

/**
 * Props:
 * - title: string
 * - titleColor: CSS color string (e.g. "#eab308", "gold", "rgb(234,179,8)")
 * - subtitle: string
 * - className?: string (optional extra classes)
 */
export default function InfoBox({ title, titleColor = "#eab308", subtitle, className = "" }) {
  return (
    <div
      className={`${styles.card} ${className}`}
      style={{ "--titleColor": titleColor }}
    >
      <div className={styles.title}>{title}</div>
      <div className={styles.subtitle}>{subtitle}</div>
    </div>
  );
}
