"use client";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/navbar/navbar";


export default function HomePage() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  // CTA logic
  const primaryCta = isAuthenticated
    ? { type: "link", label: "Continue learning", href: "/learn" }
    : { type: "action", label: "Log in to Console" };

  const handlePrimary = async () => {
    if (!isAuthenticated) {
      // Go to Auth0 OAuth
      await loginWithRedirect();
    }
  };

  return (
    <div style={styles.page}>
      <Navbar></Navbar>
        

      <main style={styles.hero}>
        <div style={styles.left}>
          <h1 style={styles.title}>
            Interview prep that’s<br />
            <span style={styles.accent}>fast, focused,</span> and minimal.
          </h1>
          <p style={styles.subtitle}>
            Code + voice practice with clean scoring and simple feedback.
          </p>

          <div style={styles.ctaRow}>
            {primaryCta.type === "link" ? (
              <Link href={primaryCta.href} style={styles.primaryBtn}>
                {primaryCta.label}
              </Link>
            ) : (
              <button onClick={handlePrimary} style={styles.primaryBtn}>
                {primaryCta.label}
              </button>
            )}

            {!isAuthenticated && (
              <button
                onClick={() =>
                  loginWithRedirect({
                    authorizationParams: { screen_hint: "signup" },
                  })
                }
                style={styles.secondaryBtn}
              >
                Create account
              </button>
            )}
          </div>

          {!isLoading && (
            <div style={styles.metaRow}>
              <span style={styles.meta}>No clutter UI</span>
              <span style={styles.dot} />
              <span style={styles.meta}>Voice or text</span>
              <span style={styles.dot} />
              <span style={styles.meta}>Round scoring</span>
            </div>
          )}
        </div>

        {/* minimal right panel (optional placeholder) */}
        <div style={styles.right}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>Preview</div>
            <div style={styles.panelBody}>
              <div style={styles.badge}>Python 3</div>
              <div style={styles.codeBox}>
                <pre style={styles.code}>
{`def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footNote}>© {new Date().getFullYear()} intr.vu</div>
      </footer>
    </div>
  );
}

/* ---------- Minimal inline styles (white + light blue) ---------- */
const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    color: "#0f172a",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },


  brand: { fontWeight: 800, letterSpacing: 0.2, color: "#2563eb" },
  linkBtn: {
    background: "none",
    border: "1px solid #d1d5db",
    color: "#111827",
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
  },

  hero: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: 24,
    padding: "48px 24px",
    maxWidth: 1400,
    width: "100%",
    margin: "0 auto",
    flex: 1,
  },
  left: { alignSelf: "center" },
  title: {
    margin: 0,
    fontSize: "clamp(32px, 4.2vw, 48px)",
    lineHeight: 1.1,
    fontWeight: 800,
  },
  accent: { color: "#2563eb" },
  subtitle: {
    marginTop: 12,
    color: "#475569",
    fontSize: 16,
    maxWidth: 560,
  },
  ctaRow: { display: "flex", gap: 12, marginTop: 20 },
  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "1px solid #2563eb",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
  },
  secondaryBtn: {
    background: "#fff",
    color: "#1f2937",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "10px 12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    color: "#6b7280",
    fontSize: 14,
  },
  meta: { padding: "2px 0" },
  dot: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    background: "#cbd5e1",
    display: "inline-block",
  },

  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    width: "100%",
    maxWidth: 480,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  },
  panelHeader: {
    padding: "12px 14px",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: 600,
    color: "#111827",
  },
  panelBody: { padding: 14 },
  badge: {
    display: "inline-block",
    background: "#111827",
    color: "#fff",
    borderRadius: 6,
    padding: "4px 8px",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 10,
  },
  codeBox: {
    background: "#f7f9fb",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 12,
    overflowX: "auto",
  },
  code: {
    margin: 0,
    fontSize: 13,
    whiteSpace: "pre",
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    color: "#111827",
  },

  footer: {
    borderTop: "1px solid #e5e7eb",
    background: "#fff",
    padding: "10px 24px",
    display: "flex",
    justifyContent: "center",
  },
  footNote: { color: "#6b7280", fontSize: 13 },

  /* responsive */
  "@media (max-width: 960px)": {}, // (left here if you want to add rules)
};
