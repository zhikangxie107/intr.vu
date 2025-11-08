// client/pages/index.js
"use client";

import MicRecorder from "../components/MicRecorder";

export default function HomePage() {
  const handleTranscript = (text) => {
    console.log("Transcript received:", text);
    // TODO: Send to GPT or show feedback
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>🎤 AI Technical Interview Practice</h1>
      <MicRecorder onTranscript={handleTranscript} />
    </main>
  );
}
