"use client";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Sign up securely with Auth0</p>

        <a
          href="/api/auth/login?screen_hint=signup"
          style={styles.authButton}
        >
          Continue with Auth0
        </a>

        <p style={styles.switchText}>
          Already have an account?{" "}
          <Link href="/login" style={styles.link}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6", // light gray background
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px 50px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    textAlign: "center",
    width: "360px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "6px",
    color: "#111",
  },
  subtitle: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "24px",
  },
  authButton: {
    display: "block",
    width: "100%",
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "15px",
    textDecoration: "none",
    transition: "background-color 0.2s ease",
  },
  switchText: {
    marginTop: "16px",
    fontSize: "13px",
    color: "#555",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
  },
};
