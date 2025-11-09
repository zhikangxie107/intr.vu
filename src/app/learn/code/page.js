'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import AICard from '../../../components/aiCard';
import ProblemTemplate from '../../../components/problemTemplate';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

	
const ASK_ENDPOINT = '/api/ask';
const TTS_ENDPOINT = '/api/tts/tts';

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name'); // e.g., "Two Sum"

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [problem, setProblem] = useState(null); // { meta, data }
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');

  // Change this if your API lives elsewhere:
  const API_BASE = ''; // same origin
  // const API_BASE = 'http://localhost:5000/api/questions'; // if different server

  useEffect(() => {
    if (!name) return;
    const fetchProblem = async () => {
      setLoading(true);
      setErr('');
      setOutput('');
      try {
        const url = `${API_BASE}/api/questions/Question/${encodeURIComponent(name)}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json(); // -> { meta, data }
        setProblem(json);

        // Prefer JS starter code; fall back to TS or a tiny JS stub
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

  // Pick the first sample (if present) to run against
  const firstSample = useMemo(() => {
    const s = problem?.data?.samples?.[0];
    return s && s.in ? s : null;
  }, [problem]);

  // Very basic runner: evaluates user JS, then calls the detected function on sample input.
  const handleRun = () => {
    try {
      if (!problem) throw new Error('No problem loaded.');
      if (!firstSample) throw new Error('No sample case found.');

      // Try to detect function name from starter code; fallback "twoSum"
      const fnMatch =
        code.match(/function\s+([A-Za-z0-9_]+)\s*\(/) ||
        code.match(/const\s+([A-Za-z0-9_]+)\s*=\s*\(/) ||
        code.match(/export\s+function\s+([A-Za-z0-9_]+)\s*\(/);
      const fnName = (fnMatch && fnMatch[1]) || 'twoSum';

      const { nums, target, ...rest } = firstSample.in;
      const callArgs =
        nums !== undefined && target !== undefined
          ? `${JSON.stringify(nums)}, ${JSON.stringify(target)}`
          : Object.values(firstSample.in)
              .map((v) => JSON.stringify(v))
              .join(', ');

      // Build and run
      const runner = new Function(
        `${code}\nreturn (${fnName}(${callArgs}));`
      );
      const result = runner();
      setOutput(`Output: ${JSON.stringify(result)}`);
    } catch (e) {
      setOutput(`Error: ${e.message}`);
    }
  };

  if (!name) {
    return <div style={{ padding: 24 }}>Missing query: <code>?name=...</code></div>;
  }

  if (loading) {
    return <div style={{ padding: 24 }}>Loading “{name}”...</div>;
  }

  if (err) {
    return <div style={{ padding: 24, color: 'crimson' }}>{err}</div>;
  }

  // Map API data to your ProblemTemplate props
  const problemData = problem?.data
    ? {
        title: problem.data.title || name,
        description: problem.data.description || [],
        examples: problem.data.examples || [],
        constraints: problem.data.constraints || [],
      }
    : { title: name, description: [], examples: [], constraints: [] };

  return (
    <div style={styles?.page || { padding: 16 }}>
      <div style={styles?.main || { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left: AI + Problem */}
        <div style={styles?.leftPane || { display: 'grid', gap: 16 }}>
          <div style={styles?.aiCardContainer || {}}>
            <AICard />
          </div>
          <div style={styles?.problemContainer || {}}>
            <ProblemTemplate {...problemData} />
          </div>
        </div>

        {/* Right: Editor + Output */}
        <div style={styles?.rightPane || { display: 'grid', gap: 16 }}>
          <div style={styles?.editorContainer || {}}>
            <CodeMirror
              value={code}
              height="400px"
              extensions={[javascript({ jsx: true })]}
              onChange={(value) => setCode(value)}
              style={styles?.codeMirror || {}}
            />
          </div>

          <div style={styles?.outputContainer || { border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <div
              style={
                styles?.outputHeader || {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderBottom: '1px solid #e5e7eb',
                }
              }
            >
              <span>Output</span>
              <button
                style={styles?.runButton || { padding: '6px 12px', border: '1px solid #111827', borderRadius: 8 }}
                onClick={handleRun}
              >
                Run
              </button>
            </div>
            <pre style={styles?.outputBox || { padding: 12, margin: 0, minHeight: 80, whiteSpace: 'pre-wrap' }}>
              {output}
            </pre>
          </div>

          {/* Optional: show meta */}
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            <strong>Tag:</strong> {problem?.meta?.tag} &nbsp;|&nbsp; <strong>Difficulty:</strong>{' '}
            {problem?.meta?.difficulty} &nbsp;|&nbsp; <strong>Duration:</strong> {problem?.meta?.duration} &nbsp;|&nbsp;{' '}
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
    border: 'none',
    color: '#22c55e',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
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
