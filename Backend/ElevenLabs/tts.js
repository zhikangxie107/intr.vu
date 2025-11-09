// src/ElevenLabs/tts.js  (ESM)
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { fileURLToPath } from 'url';

// __dirname shim for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional notes prefix/suffix
const ttsNotesPath = path.join(__dirname, 'tts-notes.txt');
let ttsNotes = '';
try {
  if (fs.existsSync(ttsNotesPath)) {
    ttsNotes = fs.readFileSync(ttsNotesPath, 'utf-8').trim();
  }
} catch {}

const router = express.Router();

// Defaults via env
const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
const DEFAULT_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_turbo_v2';
const DEFAULT_FORMAT   = process.env.ELEVENLABS_FORMAT   || 'mp3_44100_128';
const DEFAULT_LATENCY  = Number(process.env.ELEVENLABS_STREAM_LATENCY ?? 2);

// GET /api/tts/test  (after mounting)
router.get('/test', (req, res) => {
  res.json({
    ok: true,
    hasApiKey: !!ELEVEN_API_KEY,
    defaultVoiceId: DEFAULT_VOICE_ID,
    defaultModelId: DEFAULT_MODEL_ID,
    notesLoaded: !!ttsNotes,
  });
});

/**
 * POST /api/tts
 * Body: { text, voiceId?, modelId?, format?, latency?, prependNotes? }
 * Returns: audio/mpeg stream
 */
router.post('/', async (req, res) => {
  try {
    if (!ELEVEN_API_KEY) {
      return res.status(500).json({ error: 'ELEVENLABS_API_KEY missing' });
    }

    const {
      text,
      voiceId = DEFAULT_VOICE_ID,
      modelId = DEFAULT_MODEL_ID,
      format  = DEFAULT_FORMAT,
      latency = DEFAULT_LATENCY,
      prependNotes = false,
    } = req.body || {};

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const finalText = prependNotes && ttsNotes ? `${ttsNotes}\n${text}` : text;

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=${latency}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: finalText,
        model_id: modelId,
        output_format: format,
        voice_settings: { stability: 0.4, similarity_boost: 0.7 },
      }),
      duplex: 'half', // ok on Node 18+
    });

    if (!resp.ok || !resp.body) {
      const details = await safeText(resp);
      return res.status(500).json({ error: 'TTS request failed', details: details || `HTTP ${resp.status}` });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');

    const nodeStream = Readable.fromWeb(resp.body);
    nodeStream.on('error', (e) => {
      console.error('TTS stream error:', e);
      try { if (!res.headersSent) res.status(500); res.end(); } catch {}
    });

    nodeStream.pipe(res);
  } catch (err) {
    console.error('ElevenLabs error:', err?.status || '', err?.message || err);
    res.status(500).json({ error: 'Failed to generate TTS' });
  }
});

async function safeText(resp) {
  try { return await resp.text(); } catch { return ''; }
}

export default router;
