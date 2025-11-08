// elevenlabsRoute.js
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

// ---- Optional: load a small prefix/suffix used for TTS (like a chime or style note) ----
// If you don't need this, you can remove the file I/O and the prefix/suffix usage below.
const ttsNotesPath = path.join(__dirname, 'tts-notes.txt'); // create if you want
let ttsNotes = '';
try {
  if (fs.existsSync(ttsNotesPath)) {
    ttsNotes = fs.readFileSync(ttsNotesPath, 'utf-8').trim();
  }
} catch (_) {}

const router = express.Router();

// Defaults via env (can be overridden per-request)
const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
const DEFAULT_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_turbo_v2'; // fast
const DEFAULT_FORMAT = process.env.ELEVENLABS_FORMAT || 'mp3_44100_128';       // browser-friendly
const DEFAULT_LATENCY = Number(process.env.ELEVENLABS_STREAM_LATENCY ?? 2);     // 0..4 (higher = lower latency)

// Quick healthcheck
router.get('/tts/test', (req, res) => {
  const hasKey = !!ELEVEN_API_KEY;
  res.json({
    ok: true,
    hasApiKey: hasKey,
    defaultVoiceId: DEFAULT_VOICE_ID,
    defaultModelId: DEFAULT_MODEL_ID,
    notesLoaded: !!ttsNotes,
  });
});

/**
 * POST /api/tts
 * Body: { text: string, voiceId?: string, modelId?: string, format?: string, latency?: 0|1|2|3|4, prependNotes?: boolean }
 * Returns: audio/mpeg stream (default) that you can play directly in the browser.
 */
router.post('/tts', async (req, res) => {
  try {
    if (!ELEVEN_API_KEY) {
      return res.status(500).json({ error: 'ELEVENLABS_API_KEY missing' });
    }

    const {
      text,
      voiceId = DEFAULT_VOICE_ID,
      modelId = DEFAULT_MODEL_ID,
      format = DEFAULT_FORMAT,
      latency = DEFAULT_LATENCY,
      prependNotes = false, // if true, will prepend ttsNotes to text (if any)
    } = req.body || {};

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const finalText = prependNotes && ttsNotes ? `${ttsNotes}\n${text}` : text;

    // Call ElevenLabs streaming endpoint
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
        // tweak as needed:
        voice_settings: { stability: 0.4, similarity_boost: 0.7 },
        // use_speaker_boost: true,
      }),
      // Node 18+ supports fetch; duplex hint useful in some setups:
      duplex: 'half',
    });

    if (!resp.ok || !resp.body) {
      const errText = await safeText(resp);
      return res
        .status(500)
        .json({ error: 'TTS request failed', details: errText || `HTTP ${resp.status}` });
    }

    // Stream MP3 back to the client
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');

    // Convert WHATWG ReadableStream → Node stream
    const nodeStream = Readable.fromWeb(resp.body);
    nodeStream.on('error', (e) => {
      console.error('TTS stream error:', e);
      try {
        if (!res.headersSent) res.status(500);
        res.end();
      } catch (_) {}
    });

    nodeStream.pipe(res);
  } catch (err) {
    console.error('ElevenLabs error:', err?.status || '', err?.message || err);
    res.status(500).json({ error: 'Failed to generate TTS' });
  }
});

// Helper to safely read text from a Response (without throwing)
async function safeText(resp) {
  try {
    return await resp.text();
  } catch {
    return '';
  }
}

module.exports = router;
