// openaiRoute.js
require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');

const OpenAIrouter = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

OpenAIrouter.get('/test', (req, res) => {
  res.send('OpenAI Route is working!');
});

// POST /api/ask
OpenAIrouter.post('/ask', async (req, res) => {
  console.log('==============API TEST==============');
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4.1', // change to a model you   have
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
    });

    const answer = response.choices[0]?.message?.content ?? '';

    return res.json({ answer });
  } catch (err) {
    console.error('OpenAI error:', err);
    return res.status(500).json({ error: 'Failed to call OpenAI' });
  }
});

module.exports = OpenAIrouter;
