"use client";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";
import { Mic, Keyboard, BarChart3 } from "lucide-react";


export default function HomePage() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const primaryCta =
    isAuthenticated
      ? { type: "link", label: "Continue learning", href: "/learn" }
      : { type: "action", label: "Log in to Console" };

  const handlePrimary = async () => {
    if (!isAuthenticated) await loginWithRedirect();
  };

  const handleSignup = async () => {
    await loginWithRedirect({ authorizationParams: { screen_hint: "signup" } });
  };

  return (
    <div style={S.page}>
      {/* BRAND (top-left) */}
      <header style={S.header}>
        <Link href="/" style={S.brand}>intr.vu</Link>
      </header>

      {/* HERO: left copy, right preview (no graph) */}
      <section style={S.hero}>
        <div style={S.heroLeft}>
          <h1 style={S.title}>
            Interview prep that’s <span style={S.accent}>fast</span> and <span style={S.accent}>effective</span>
          </h1>
          <p style={S.sub}>
            Conversational AI interviews, in-browser coding, and actionable feedback.
          </p>

          <div style={S.ctaRow}>
            {primaryCta.type === "link" ? (
              <Link href={primaryCta.href} style={S.primary}>{primaryCta.label}</Link>
            ) : (
              <button onClick={handlePrimary} style={S.primary}>{primaryCta.label}</button>
            )}
            {!isAuthenticated && (
              <button onClick={handleSignup} style={S.secondary}>Create account</button>
            )}
          </div>
        </div>

        {/* Simple preview card to balance layout (no node graph) */}
        <div style={S.heroRight} aria-hidden>
          <div style={S.previewCard}>
            <div style={S.previewHeader}>
              <span style={S.dot} /><span style={S.dot} /><span style={S.dot} />
              <span style={S.previewTitle}>Live Round Preview</span>
            </div>
            <div style={S.previewBody}>
              <div style={S.badge}>Python 3</div>
              <div style={S.transcript}>
                <div style={S.role}>Interviewer</div>
                <div style={S.text}>Walk me through an O(n) approach to Two Sum.</div>
                <div style={S.roleUser}>You</div>
                <div style={S.text}>Use a hash map of seen values and check target − n…</div>
              </div>
              <div style={S.codeBox}>
                <pre style={S.code}>
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
      </section>

      {/* FEATURE STRIP (three items like the example) */}
      <section style={S.features}>
        <div style={S.featuresGrid}>
          <Feature
            icon={<Mic size={20} />}
            title="Realistic Conversation"
            sub="AI trained to mimic top interviwers"
          />
          <Feature
            icon={<Keyboard size={20} />}
            title="In-Browser Coding"
            sub="Whiteboard and run your code in our editor"
          />
          <Feature
            icon={<BarChart3 size={20} />}
            title="Round Scoring"
            sub="Clear feedback and notes to help you improve"
          />
        </div>
      </section> 
    </div>
  );
}

function Feature({ icon, title, sub }) {
  return (
    <div style={S.featureItem}>
      <div style={S.featureIcon}>{icon}</div>
      <div>
        <div style={S.featureTitle}>{title}</div>
        <div style={S.featureSub}>{sub}</div>
      </div>
    </div>
  );
}

const S = {
  /* Page + brand */
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f5f7fa",          // your light bg
    color: "#0f172a",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  header: { padding: "16px 24px" },
  brand: {
    fontWeight: 900,
    fontSize: 32,
    letterSpacing: 0.4,
    color: "#0f172a",
    textDecoration: "none",
  },

  /* Hero layout */
  hero: {
    flex: .5,
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: 24,
    alignItems: "center",
    padding: "24px",
    maxWidth: 1200,
    width: "100%",
    margin: "0 auto",
  },
  heroLeft: { maxWidth: 640 },
  heroRight: { display: "flex", justifyContent: "center" },

  /* Copy */
  title: {
    margin: 0,
    fontSize: "clamp(34px, 5vw, 52px)",
    lineHeight: 1.08,
    fontWeight: 900,
  },
  accent: { color: "#74CAF2" },     // your accent blue
  sub: {
    marginTop: 10,
    color: "#475569",
    fontSize: 16,
  },

  /* CTAs */
  ctaRow: { display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" },
  primary: {
    background: "#74CAF2",
    color: "#fff",
    border: "1px solid #74CAF2",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
    textDecoration: "none",
  },
  secondary: {
    background: "#fff",
    color: "#1f2937",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "10px 12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  /* Preview card (simple, no graph) */
  previewCard: {
    width: "100%",
    maxWidth: 520,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    boxShadow: "0 8px 24px rgba(0,0,0,.06)",
    overflow: "hidden",
  },
  previewHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 12px",
    borderBottom: "1px solid #e5e7eb",
    background: "#fbfdff",
  },
  dot: { width: 8, height: 8, borderRadius: 8, background: "#e5e7eb" },
  previewTitle: { marginLeft: 8, fontSize: 12, color: "#64748b", fontWeight: 700 },
  previewBody: { padding: 14 },
  badge: {
    display: "inline-block",
    background: "#0f172a",
    color: "#fff",
    borderRadius: 6,
    padding: "4px 8px",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 10,
  },
  transcript: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  role: { fontSize: 12, fontWeight: 800, color: "#0f172a" },
  roleUser: { fontSize: 12, fontWeight: 800, color: "#74CAF2" },
  text: { fontSize: 13, color: "#334155", marginTop: 4 },
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

  /* Feature row (like the bottom row in the image) */
  features: { padding: "16px 24px 24px" },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
    maxWidth: 1200,
    margin: "0 auto",
  },
  featureItem: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 14,
  },
  featureIcon: { fontSize: 20, lineHeight: 1 },
  featureTitle: { fontWeight: 800, marginBottom: 2 },
  featureSub: { color: "#475569", fontSize: 13.5 },

  /* Footer */
  footer: {
    borderTop: "1px solid #e5e7eb",
    background: "#fff",
    padding: "10px 16px",
    display: "flex",
    justifyContent: "center",
  },
  footNote: { color: "#6b7280", fontSize: 13 },

  /* Responsive */
  "@media (maxWidth: 960px)": {},
};
