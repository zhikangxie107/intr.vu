'use client';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import AICard from '../../../components/aiCard';              // <= use '../../../components/AICard' if your file is capitalized
import ProblemTemplate from '../../../components/problemTemplate';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

	
const ASK_ENDPOINT = '/api/ask';
const TTS_ENDPOINT = '/api/tts/tts';

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name'); // e.g., "Two Sum"

  // Problem + editor state
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [problem, setProblem] = useState(null); // { meta, data }
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');

  // Chat/TTS state
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);

  // audio lifecycle for TTS
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
    audio.play().catch(() => {});
  };

  // Called by AICard after Whisper returns text
  const handleTranscript = async (text) => {
    const prompt = (text || '').trim();
    if (!prompt) return;

    setAsking(true);
    setAnswer('');
    try {
      const res = await fetch(ASK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        setAnswer(`Ask failed: ${await res.text()}`);
        return;
      }
      const data = await res.json();
      const textAnswer = typeof data === 'string' ? data : data.answer ?? '';
      setAnswer(textAnswer || '(no answer)');
      if (textAnswer) await speak(textAnswer);
    } catch (e) {
      console.error(e);
      setAnswer('Request failed. See console for details.');
    } finally {
      setAsking(false);
    }
  };

  // ---- Problem fetch (yours, unchanged except for minor organization) ----
  const API_BASE = ''; // same origin

  useEffect(() => {
    if (!name) return;
    const fetchProblem = async () => {
      setLoading(true);
      setErr('');
      setOutput('');
      try {
        const url = `${API_BASE}/api/questions/Question/${encodeURIComponent(name)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json(); // -> { meta, data }
        setProblem(json);

        const jsStarter =
          json?.data?.starterCode?.js ??
          json?.data?.starterCode?.ts ??
          `function twoSum(nums, target) {\n  // TODO: implement\n  return [0, 0];\n}\n`;
        setCode(jsStarter);
      } catch (e) {
        setErr(`Failed to load problem: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [name]);

  const firstSample = useMemo(() => {
    const s = problem?.data?.samples?.[0];
    return s && s.in ? s : null;
  }, [problem]);

  // Very basic JS runner on the first sample input
  const handleRun = () => {
    try {
      if (!problem) throw new Error('No problem loaded.');
      if (!firstSample) throw new Error('No sample case found.');

      const fnMatch =
        code.match(/function\s+([A-Za-z0-9_]+)\s*\(/) ||
        code.match(/const\s+([A-Za-z0-9_]+)\s*=\s*\(/) ||
        code.match(/export\s+function\s+([A-Za-z0-9_]+)\s*\(/);
      const fnName = (fnMatch && fnMatch[1]) || 'twoSum';

      const { nums, target } = firstSample.in ?? {};
      const callArgs =
        nums !== undefined && target !== undefined
          ? `${JSON.stringify(nums)}, ${JSON.stringify(target)}`
          : Object.values(firstSample.in || {})
              .map((v) => JSON.stringify(v))
              .join(', ');

      const runner = new Function(`${code}\nreturn (${fnName}(${callArgs}));`);
      const result = runner();
      setOutput(`Output: ${JSON.stringify(result)}`);
    } catch (e) {
      setOutput(`Error: ${e.message}`);
    }
  };

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
            <CodeMirror
              value={code}
              height="400px"
              extensions={[javascript({ jsx: true })]}
              onChange={(value) => setCode(value)}
              style={styles.codeMirror}
            />
          </div>

          <div style={styles.outputContainer}>
            <div style={styles.outputHeader}>
              <span>Output</span>
              <button style={styles.runButton} onClick={handleRun}>Run</button>
            </div>
            <pre style={styles.outputBox}>{output}</pre>
          </div>

          <div style={{ fontSize: 13, color: '#6b7280' }}>
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
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f7f9fb',
  },
  editorContainer: {
    flex: 1,
    borderBottom: '1px solid #e0e0e0',
  },
  codeMirror: {
    fontSize: '14px',
    fontFamily: 'monospace',
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
    border: '1px solid #111827',
    borderRadius: 8,
    padding: '6px 12px',
    cursor: 'pointer',
  },
  outputBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    minHeight: '60px',
    padding: '10px',
    fontFamily: 'monospace',
    fontSize: '13px',
    whiteSpace: 'pre-wrap',
    color: '#222',
  },
};
