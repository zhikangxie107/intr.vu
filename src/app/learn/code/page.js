'use client';
import { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AICard from '../../../components/aiCard';
import ProblemTemplate from '../../../components/problemTemplate';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';

const ASK_ENDPOINT = '/api/richAsk'; // takes in sessionID + prompt
const TTS_ENDPOINT = '/api/tts/';
const SESSION_ENDPOINT = '/api/session/createSession';
const CODE_UPLOAD_ENDPOINT = '/api/session/uploadCode';
const APPEND_CHAT_ENDPOINT = '/api/session/appendChat';
const GET_SESSION_ENDPOINT = '/api/session/getSession/';

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name'); // e.g., "Two Sum"

  // Problem + editor state
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [problem, setProblem] = useState(null); // { meta, data }
  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('');       // used by JDoodle run
  const [output, setOutput] = useState('');

  // Chat/TTS state
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // audio lifecycle for TTS
  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);
  const ttsAbortRef = useRef(null);

  // sessionID
  const [sessionID, setSessionID] = useState(null);

  // ---------- audio helpers ----------
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
    const res = await fetch(TTS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: ttsAbortRef.current.signal,
    });
    if (!res.ok) {
      console.error('TTS failed:', await res.text());
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;

    const audio = new Audio(url);
    audioRef.current = audio;
    setSpeaking(true);
    audio.onended = () => setSpeaking(false);
    audio.play().catch(() => setSpeaking(false));
  };

  // ---------- backend helpers ----------
  const uploadCode = async (codeContent) => {
    if (!sessionID) {
      console.warn('uploadCode: missing sessionId, skipping');
      return;
    }
    try {
      const res = await fetch(CODE_UPLOAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionID, codeContent }),
      });
      if (!res.ok) {
        console.error('Code upload failed:', await res.text());
      }
    } catch (e) {
      console.error('Unexpected error (uploadCode):', e);
    }
  };

  const uploadChat = async (prompt, response) => {
    if (!sessionID) {
      console.warn('uploadChat: missing sessionId, skipping');
      return;
    }
    try {
      const res = await fetch(APPEND_CHAT_ENDPOINT, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionID, prompt, response }),
      });
      if (!res.ok) {
        console.error('Chat upload failed:', await res.text());
      }
    } catch (e) {
      console.error('Unexpected error (uploadChat):', e);
    }
  };

  // ---------- main ask pipeline ----------
  const handleTranscript = async (text) => {
    const prompt = (text || '').trim();
    if (!prompt) return;

    if (!sessionID) {
      setAnswer('Session not ready yet—please wait a moment and try again.');
      return;
    }

    setAsking(true);
    setAnswer('');
    await uploadCode(code);
    try {
      const res = await fetch(ASK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, sessionId: sessionID }),
      });
      if (!res.ok) {
        setAnswer(`Ask failed: ${await res.text()}`);
        return;
      }
      const data = await res.json();
      const textAnswer = typeof data === 'string' ? data : data.answer ?? '';

      const promptToAppend = { role: 'user', content: prompt };
      const responseToAppend = { role: 'interviwer', content: textAnswer }; // keep your label
      await uploadChat(promptToAppend, responseToAppend);

      setAnswer(textAnswer || '(no answer)');
      if (textAnswer) await speak(textAnswer);
    } catch (e) {
      console.error(e);
      setAnswer('Request failed. See console for details.');
    } finally {
      setAsking(false);
    }
  };

  // ---------- effects ----------

  // Load problem data (prefer Python starter)
  useEffect(() => {
    if (!name) return;

    let cancelled = false;
    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setErr('');
      setOutput('');
      try {
        const url = `/api/questions/Question/${encodeURIComponent(name)}`;
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json(); // -> { meta, data }
        if (cancelled) return;

        setProblem(json);

        const pyStarter =
          json?.data?.starterCode?.py ??
          `# Write your solution here\n\ndef two_sum(nums, target):\n    # TODO: implement\n    return [0, 0]\n\nif __name__ == "__main__":\n    print(two_sum([2,7,11,15], 9))\n`;
        setCode(pyStarter);
      } catch (e) {
        if (!cancelled && e?.name !== 'AbortError') {
          setErr(`Failed to load problem: ${e?.message || 'unknown error'}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; ac.abort(); };
  }, [name]);

  // Create session for this user + problem
  useEffect(() => {
    if (!name) return;
    (async () => {
      try {
        const res = await fetch(SESSION_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'demoUser', questionName: name }),
        });
        if (!res.ok) {
          console.error('Session creation failed:', await res.text());
          return;
        }
        const data = await res.json();
        setSessionID(data.id);
      } catch (e) {
        console.error('Session creation failed:', e);
      }
    })();
  }, [name]);

  // first time sessionID is set make interviewer do a greeting prompt
  useEffect(() => {
    if (!sessionID) return;
    const doGreeting = async () => {
      const greetingPrompt =
        'Greet the candidate and ask them to describe their approach to solving the problem so far.';
      await handleTranscript(greetingPrompt);
    };
    doGreeting();
  }, [sessionID]);

  // use effect to call richAsk every 45 seconds with a progress question
  useEffect(() => {
    if (!sessionID) return;
    const interval = setInterval(async () => {
      try {
        const getSessionRes = await fetch(GET_SESSION_ENDPOINT + sessionID);
        if (!getSessionRes.ok) {
          console.error('Session fetch failed:', await getSessionRes.text());
          return;
        }
        const sessionData = await getSessionRes.json();
        if (sessionData.status === 'ACTIVE' && !asking) {
          await handleTranscript('Ask me a question about my code progress.');
        }
      } catch (e) {
        console.error('Error in session polling:', e);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [sessionID, asking]);

  // ---------- run code (JDoodle) ----------
  const handleRun = async () => {
    try {
      setOutput('Running on JDoodle…');
      const res = await fetch('/api/runCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: code,
          language: 'python3',
          versionIndex: '4',
          stdin: stdin || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOutput(`Error: ${data.error || JSON.stringify(data)}`);
        return;
      }

      const lines = [
        data.output ?? '',
        '',
        `status: ${data.statusCode}`,
        data.cpuTime ? `cpuTime: ${data.cpuTime}` : '',
        data.memory ? `memory: ${data.memory}` : '',
      ].filter(Boolean);
      setOutput(lines.join('\n'));
    } catch (e) {
      setOutput(`Error: ${e.message}`);
    }
  };

  const handleReplay = async () => {
    if (!answer || asking || speaking) return;
    await speak(answer);
  };

  // ---------- render ----------
  if (!name) return <div style={{ padding: 24 }}>Missing query: <code>?name=...</code></div>;
  if (loading) return <div style={{ padding: 24 }}>Loading “{name}”...</div>;
  if (err) return <div style={{ padding: 24, color: 'crimson' }}>{err}</div>;

  const problemData = problem?.data
    ? {
        title: problem.data.title || name,
        description: problem.data.description || [],
        examples: problem.data.examples || [],
        constraints: problem.data.constraints || [],
      }
    : { title: name, description: [], examples: [], constraints: [] };

  return (
    <div style={styles.page}>
      <div style={styles.main}>
        {/* Left: AI + Problem */}
        <div style={styles.leftPane}>
          <div>
            <AICard
              answer={answer}
              loading={asking}
              onTranscript={handleTranscript}
            />
          </div>

          <div style={styles.problemContainer}>
            <ProblemTemplate {...problemData} />
          </div>
        </div>

        {/* Right: Editor + Output */}
        <div style={styles.rightPane}>
          <div style={styles.editorContainer}>
            {/* toolbar line (Python 3 badge + stdin + Run) */}
            <div style={styles.toolbar}>
              <span style={styles.badge}>Python 3</span>
              <input
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="optional program input"
                style={styles.stdin}
              />
              <button style={styles.runButton} onClick={handleRun}>Run</button>
            </div>

            <CodeMirror
              value={code}
              height="46vh"
              extensions={[python()]}
              onChange={(value) => setCode(value)}
              style={styles.codeMirror}
            />
          </div>

          <div style={styles.outputContainer}>
            <div style={styles.outputHeader}>
              <span>Output</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={styles.runButton} onClick={handleRun}>Run</button>
                <button
                  style={styles.secondaryBtn}
                  onClick={handleReplay}
                  disabled={!answer || asking || speaking}
                >
                  Replay
                </button>
                <button
                  style={styles.secondaryBtn}
                  onClick={cleanupAudio}
                  disabled={!speaking}
                >
                  Stop
                </button>
              </div>
            </div>
            <pre style={styles.outputBox}>{output}</pre>
          </div>

          <div style={{ fontSize: 13, color: '#6b7280', padding: '8px 16px' }}>
            <strong>Tag:</strong> {problem?.meta?.tag} &nbsp;|&nbsp;
            <strong>Difficulty:</strong> {problem?.meta?.difficulty} &nbsp;|&nbsp;
            <strong>Duration:</strong> {problem?.meta?.duration} &nbsp;|&nbsp;
            <strong>Likes:</strong> {problem?.meta?.likes}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    backgroundColor: '#f5f7fa',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollSnapType: 'x mandatory',
  },
  leftPane: {
    flex: '0 0 50%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRight: '1px solid #e0e0e0',
    padding: '24px',
    height: '100vh',
    boxSizing: 'border-box',
    overflow: 'hidden',
    scrollSnapAlign: 'start',
    gap: '16px',
  },
  problemContainer: {
    flex: 1,
    overflowY: 'auto',
    marginTop: 8,
  },
  rightPane: {
    flex: 1,
    display: 'grid',
    gridTemplateRows: 'minmax(52vh, 520px) auto', // editor row then Output row
    backgroundColor: '#f7f9fb',
    minHeight: '100vh',
  },
  editorContainer: {
    borderBottom: '1px solid #e0e0e0',
    background: '#fff',
    padding: '8px 12px',
    overflow: 'hidden',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 0 10px',
  },
  badge: {
    background: '#111827',
    color: '#fff',
    borderRadius: 6,
    padding: '4px 8px',
    fontSize: 12,
    fontWeight: 700,
  },
  stdin: {
    flex: 1,
    minWidth: 200,
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    outline: 'none',
  },
  codeMirror: {
    fontSize: '14px',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  outputContainer: {
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e0e0e0',
  },
  outputHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontWeight: '500',
  },
  runButton: {
    background: 'none',
    border: '1px solid #16a34a',
    color: '#16a34a',
    borderRadius: 8,
    padding: '6px 12px',
    cursor: 'pointer',
    fontWeight: 700,
  },
  secondaryBtn: {
    background: 'none',
    border: '1px solid #9ca3af',
    color: '#374151',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer',
  },
  outputBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    minHeight: '230px',
    padding: '10px',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '13px',
    whiteSpace: 'pre-wrap',
    color: '#222',
  },
};
