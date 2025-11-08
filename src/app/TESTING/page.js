'use client';

import { useState } from 'react';

export default function TestPage() {
  const [value, setValue] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setAnswer(null);

      const res = await fetch('/api/ask', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt: value }) });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      setAnswer(JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(e);
      setAnswer('Request failed. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Test Page</h1>
      <input
        type="text"
        placeholder="Enter something..."
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && value.trim() && !loading) handleSubmit();
        }}
      />
      <button onClick={handleSubmit} disabled={loading || !value.trim()}>
        {loading ? 'Sending...' : 'Submit'}
      </button>
      {answer && (
        <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{answer}</pre>
      )}
    </div>
  );
}
