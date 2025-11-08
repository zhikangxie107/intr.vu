// client/components/MicRecorder.jsx
import { useState, useRef } from "react";

/**
 * MicRecorder component
 * - Handles browser microphone access
 * - Records audio and sends it to a backend (coming next)
 * - Returns transcribed text via `onTranscript` prop
 */
export default function MicRecorder({ onTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Start recording with browser mic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "audio/webm" // ✅ OpenAI supports this
      });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        // TODO: Send this blob to your backend API
        console.log("🎙️ Blob type:", blob.type); // <-- add this line

        const formData = new FormData();
        const file = new File([blob], "recording.webm", { type: "audio/webm" });
        formData.append("file", file);


        const response = await fetch("http://localhost:3001/api/whisper", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        onTranscript?.(data.text); // Send transcript back up
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        style={{
          backgroundColor: isRecording ? "#e11d48" : "#10b981",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {isRecording ? "Stop Recording" : "Start Speaking"}
      </button>
    </div>
  );
}
