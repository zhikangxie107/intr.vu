'use client';
import { useRef, useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

/**
 * Props:
 *  - onTranscript(text: string)
 *  - answer?: string
 *  - loading?: boolean
 *  - sttEndpoint?: string  (default '/api/whisper')
 *  - name?: string         (default 'Mark')
 *  - avatarUrl?: string
 */
export default function AICard({
  onTranscript,
  answer = '',
  loading = false,
  sttEndpoint = '/api/whisper',
  name = 'Mark',
  avatarUrl = 'https://i.pravatar.cc/150?img=3',
}) {
  const [listening, setListening] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      mr.ondataavailable = (e) => e.data?.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        try {
          stream.getTracks().forEach((t) => t.stop());
          streamRef.current = null;

          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          chunksRef.current = [];
          const form = new FormData();
          form.append('file', blob, 'audio.webm');

          const res = await fetch(sttEndpoint, { method: 'POST', body: form });
          if (!res.ok) { console.error('STT failed:', await res.text()); return; }
          const data = await res.json();
          onTranscript?.(data?.text || '');
        } catch (err) {
          console.error('STT error:', err);
        }
      };

      mediaRecorderRef.current = mr;
      mr.start();
      setListening(true);
    } catch (err) {
      console.error('Mic permission / recorder error:', err);
      setListening(false);
    }
  }

  function stopRecording() {
    try {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current = null;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    } catch {}
    setListening(false);
  }

  const toggleMic = () => (listening ? stopRecording() : startRecording());

  return (
    <>
      <div className="ai-card">
        <div className="ai-inner">
          {/* LEFT: compact profile */}
          <div className="ai-left">
            <img src={avatarUrl} alt="AI Avatar" className="ai-avatar" />
            <div className="ai-name">{name}</div>
            <button
              className={`mic-button ${listening ? 'active' : ''}`}
              onClick={toggleMic}
              aria-label={listening ? 'Stop recording' : 'Start recording'}
              title={listening ? 'Stop recording' : 'Start recording'}
            >
              {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>
          </div>

          {/* RIGHT: chat */}
          <div className="ai-right">
            <div className="chat-header">Interview Chat</div>
            <div className="chat-body">
              <pre className={`answer ${!answer && !loading ? 'placeholder' : ''}`}>
                {loading ? 'Thinking…' : (answer || 'Ask a question with the mic to see the response here.')}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <style>{css}</style>
    </>
  );
}

const css = `
/* Card container */
.ai-card {
  width: 100%;
  background: linear-gradient(180deg, #f7f9fc 0%, #f2f4f8 100%);
  border-radius: 16px;
  padding: 10px;
  box-sizing: border-box;
}

/* Two columns; smaller left column; keep everything inside */
.ai-inner {
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr);
  gap: 12px;
  align-items: stretch;
  overflow: hidden;
}

/* LEFT column — compact and left-aligned */
.ai-left {
  background: #fff;
  border: 1px solid #e6e8eb;
  border-radius: 12px;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 210px;
  box-shadow: 0 1px 2px rgba(16,24,40,.03);
}

.ai-avatar {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
}

.ai-name {
  font-weight: 700;
  color: #0f172a;
  font-size: 15px;
}

/* Smaller mic */
.mic-button {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #334155;
  font-size: 15px;
  transition: background-color .2s ease, color .2s ease, transform .08s ease, border-color .2s ease;
}
.mic-button:hover { background: #eceff3; }
.mic-button:active { transform: scale(0.98); }
.mic-button.active { background: #ef4444; color: #fff; border-color: #ef4444; }

/* RIGHT column — fits content and limits bubble width */
.ai-right {
  background: #fff;
  border: 1px solid #e6e8eb;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  min-width: 590px;
  box-shadow: 0 1px 2px rgba(16,24,40,.03);
  overflow: hidden;
}

.chat-header {
  padding: 10px 12px;
  font-weight: 800;
  border-bottom: 1px solid #e6e8eb;
  background: #fff;
}

.chat-body {
  padding: 14px 16px;  /* a little more breathing room */
  overflow-y: auto;
  flex: 1;
  display: flex;
  align-items: flex-start;
}

/* Larger bubble but still restrained horizontally */
.answer {
  margin: 0;
  white-space: pre-wrap;
  padding: 14px 16px;
  border-radius: 8px;
  background: #e1e3e6;
  color: #0f172a;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 14px;
  min-height: 140px;
  width: clamp(300px, 80%, 760px);
  box-sizing: border-box;
}
.answer.placeholder { color: #6b7280; }

/* Stack on small screens */
@media (max-width: 1100px) {
  .ai-inner { grid-template-columns: 1fr; }
  .answer { width: 100%; }
}
`;
