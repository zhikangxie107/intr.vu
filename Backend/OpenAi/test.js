// openaiRoute.js
require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');

// read systemprompt.txt and store in a variable
const fs = require('fs');
const path = require('path');
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
      // pick a small, speedy model
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 120,           // cap output length
      // optional: stop early if the model starts another section
      stop: ['\n\n'],
      messages: [
        {
          role: 'system',
          content:systemPrompt,
        },
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

module.exports = router;
