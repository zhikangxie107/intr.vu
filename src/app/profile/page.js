"use client";
import Navbar from "../../components/navbar/navbar";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Profile() {
  const [hover, setHover] = useState(false); 
  const { logout, user, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        window.location.href = "/";
      }
    }, [isAuthenticated, isLoading]);
  if (isLoading) return <p>Loading...</p>;
  

  return (
    <div className="flex min-h-screen">
      {/* Left sidebar */}
      <Navbar />

      {/* Main content */}
      <main style={{ marginLeft: "6rem", padding: "2rem" }}>
        {isAuthenticated && user ? (
          <h1>Hello, {user.name}</h1>
        ) : (
          <h1>Hello</h1>
        )}
        <div
          style={{
            height: "100vh",           // full viewport height
            display: "flex",           // flex container
            justifyContent: "center",  // horizontally center
            alignItems: "center",      // vertically center
          }}
        >
          <button
            onClick={() =>
              logout({
                returnTo: typeof window !== "undefined" ? window.location.origin : "/",
              })
            }
            onMouseEnter={() => setHover(true)}   
            onMouseLeave={() => setHover(false)} 
            style={{
              backgroundColor: hover ? "darkred" : "red",
              color: "white",
              padding: "32px 64px",   // bigger padding
              fontSize: "36px",        // larger text
              borderRadius: "8px",     // slightly bigger corners
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              minWidth: "400px",       // optional: fixed width
              minHeight: "120px",       // optional: fixed height
              transition: "background-color 0.3s ease",
            }}
          >
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
}
