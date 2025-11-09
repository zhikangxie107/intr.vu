"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.appName}>intr.vu</h1>
        <p style={styles.slogan}>interviewing made easier</p>

        <div style={styles.buttons}>
          <Link href="/login" style={styles.loginBtn}>
            Log in
          </Link>
          <Link href="/signup" style={styles.signupBtn}>
            Sign up
          </Link>
        </div>
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
  container: {
    backgroundColor: "#fff",
    padding: "50px 60px",
    borderRadius: "16px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    textAlign: "center",
    width: "380px",
  },
  appName: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#111",
    marginBottom: "8px",
  },
  slogan: {
    fontSize: "15px",
    color: "#555",
    marginBottom: "36px",
    letterSpacing: "0.3px",
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  loginBtn: {
    display: "block",
    textDecoration: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "12px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "15px",
    transition: "background-color 0.2s ease",
  },
  signupBtn: {
    display: "block",
    textDecoration: "none",
    backgroundColor: "#fff",
    color: "#2563eb",
    border: "1px solid #2563eb",
    padding: "12px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "15px",
    transition: "all 0.2s ease",
  },
};
