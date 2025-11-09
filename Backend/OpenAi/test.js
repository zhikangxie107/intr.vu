import dotenv from 'dotenv';
import express from 'express';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

// Support __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const systemPromptPath = path.join(__dirname, 'systemprompt.txt');
const systemPrompt = fs.readFileSync(systemPromptPath, 'utf-8');

const router = express.Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/ask', async (req, res) => {
  console.log(systemPrompt);
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 120,
      stop: ['\n\n'],
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    const answer = response.choices[0]?.message?.content?.trim() ?? '';
    res.json({ answer });
  } catch (err) {
    console.error('OpenAI error:', err?.status, err?.message || err);
    res.status(500).json({ error: 'Failed to call OpenAI' });
  }
});

export default router;
