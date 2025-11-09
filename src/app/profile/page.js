"use client";
import { useAuth0 } from "@auth0/auth0-react";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <p>Loading...</p>;
  if (!isAuthenticated) return null;

  return (
    <div style={{ textAlign: "center", marginTop: "1rem" }}>
      <img
        src={user.picture}
        alt={user.name}
        style={{ borderRadius: "50%", width: 80, height: 80 }}
      />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
