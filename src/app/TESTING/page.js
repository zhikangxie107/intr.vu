'use client';

import { useRef, useState } from 'react';

export default function TestPage() {
  const [value, setValue] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);
  const ttsAbortRef = useRef(null);

  const cleanupAudio = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (ttsAbortRef.current) {
        ttsAbortRef.current.abort();
        ttsAbortRef.current = null;
      }
    } catch {}
    setSpeaking(false);
  };

  const speak = async (text) => {
    if (!text?.trim()) return;
    cleanupAudio();

    ttsAbortRef.current = new AbortController();

    const res = await fetch('/api/tts/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }), // server will use default voice/model
      signal: ttsAbortRef.current.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`TTS failed: ${errText}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;

    const audio = new Audio(url);
    audioRef.current = audio;

    setSpeaking(true);
    audio.onended = () => {
      setSpeaking(false);
      // keep URL for Replay; revoke on next cleanup
    };
    await audio.play();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setAnswer(null);

      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: value }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      const textAnswer = typeof data === 'string' ? data : (data.answer ?? '');
      setAnswer(textAnswer || '(no answer)');

      // Kick off TTS
      if (textAnswer) await speak(textAnswer);
    } catch (e) {
      console.error(e);
      setAnswer('Request failed. See console for details.');
      cleanupAudio();
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => cleanupAudio();
  const handleReplay = async () => {
    if (!answer) return;
    await speak(answer);
  };

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1>Interview Test</h1>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Type your question…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim() && !loading) handleSubmit();
          }}
          style={{ flex: 1 }}
        />
        <button onClick={handleSubmit} disabled={loading || !value.trim()}>
          {loading ? 'Sending…' : 'Ask'}
        </button>
      </div>

      {answer && (
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            marginTop: 4,
            padding: 8,
            background: '#1113',
            borderRadius: 6,
          }}
        >
          {answer}
        </pre>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleReplay} disabled={!answer || speaking || loading}>
          Replay
        </button>
        <button onClick={handleStop} disabled={!speaking}>
          Stop
        </button>
      </div>
    </div>
  );
}
