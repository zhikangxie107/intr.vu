'use client';

import { useRef, useState } from 'react';
import MicRecorder from '../../components/MicRecorder'; // adjust path if needed

// Centralize endpoints so you can change them in one place
const ASK_ENDPOINT = '/api/ask';
const TTS_ENDPOINT = '/api/tts/tts'; // use '/api/tts' if that's your route
const STT_ENDPOINT = '/api/whisper'; // MicRecorder already posts here

export default function TestPage() {
	const [value, setValue] = useState('');
	const [answer, setAnswer] = useState(null);
	const [loading, setLoading] = useState(false);
	const [speaking, setSpeaking] = useState(false);
	const [lastTranscript, setLastTranscript] = useState('');
	const [autoAsk, setAutoAsk] = useState(true); // auto-send transcript to GPT+TTS

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

		const res = await fetch(TTS_ENDPOINT, {
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
			// Keep URL for Replay; revoked on next cleanup
		};
		await audio.play();
	};

	// Core ask -> speak pipeline
	const askAndSpeak = async (promptText) => {
		setLoading(true);
		setAnswer(null);
		try {
			const res = await fetch(ASK_ENDPOINT, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt: promptText }),
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(`HTTP ${res.status}: ${text}`);
			}

			const data = await res.json();
			const textAnswer = typeof data === 'string' ? data : data.answer ?? '';
			setAnswer(textAnswer || '(no answer)');

			if (textAnswer) await speak(textAnswer);
		} catch (e) {
			console.error(e);
			setAnswer('Request failed. See console for details.');
			cleanupAudio();
		} finally {
			setLoading(false);
		}
	};

	// Existing button flow
	const handleSubmit = async () => {
		const promptText = value.trim();
		if (!promptText) return;
		await askAndSpeak(promptText);
	};

	// NEW: Wire teammate’s MicRecorder -> transcript -> askAndSpeak (optional)
	const handleTranscript = async (text) => {
		setLastTranscript(text || '');
		setValue(text || '');
		if (autoAsk && text?.trim()) {
			await askAndSpeak(text.trim());
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

			{/* Speech input (Mic) */}
			<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
				<MicRecorder onTranscript={handleTranscript} />
				<label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
					<input
						type="checkbox"
						checked={autoAsk}
						onChange={(e) => setAutoAsk(e.target.checked)}
					/>
					Auto-send transcript to interviewer
				</label>
			</div>

			{lastTranscript ? (
				<div style={{ fontSize: 13, opacity: 0.8 }}>
					Last transcript:&nbsp;<em>{lastTranscript}</em>
				</div>
			) : null}

			{/* Text input fallback */}
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

			{/* LLM answer */}
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

			{/* Audio controls */}
			<div style={{ display: 'flex', gap: 8 }}>
				<button
					onClick={handleReplay}
					disabled={!answer || speaking || loading}
				>
					Replay
				</button>
				<button onClick={handleStop} disabled={!speaking}>
					Stop
				</button>
			</div>
		</div>
	);
}
