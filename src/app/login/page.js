"use client";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";

export default function LoginPage() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  // Optional redirect if already logged in
  if (isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return null;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Log in securely with Auth0</p>

        <button
          onClick={() => loginWithRedirect()}
          style={styles.authButton}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Continue with Auth0"}
        </button>

        <p style={styles.switchText}>
          Don’t have an account?{" "}
          <Link href="/signup" style={styles.link}>
            Sign up
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
    backgroundColor: "#f3f4f6", // soft gray background
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
    cursor: "pointer",
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
