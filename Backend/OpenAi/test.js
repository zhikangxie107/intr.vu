// src/OpenAi/route.js  (ESM)
import 'dotenv/config';
import { Router } from 'express';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname shim for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// read systemprompt.txt once at startup
const systemPromptPath = path.join(__dirname, 'systemprompt.txt');
let systemPrompt = '';
try {
  systemPrompt = fs.readFileSync(systemPromptPath, 'utf-8');
} catch {
  // optional: keep a fallback
  systemPrompt = 'You are a helpful interviewer.';
}

const router = Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/ask', async (req, res) => {
  try {
    const { prompt } = req.body ?? {};
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 120,
      stop: ['\n\n'],
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    const answer = resp.choices?.[0]?.message?.content?.trim() ?? '';
    res.json({ answer });
  } catch (err) {
    console.error('OpenAI error:', err?.status, err?.message || err);
    res.status(500).json({ error: 'Failed to call OpenAI' });
  }
});

export default router;
