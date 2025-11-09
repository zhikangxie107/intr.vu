// routes/questions.js (ESM) — keeps your endpoints, adds /richAsk, and imports JSON directly
import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';
import { supabase } from '../supabaseClient.js';

// ✅ Simple & robust: direct JSON import (Node ≥18 with JSON import assertions)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Resolve relative to THIS file — then go up one dir into Questions/
const questionsPath = path.resolve(__dirname, '../Questions/questionsData.json');
const questionsJson = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

const router = express.Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---------------------- Utilities & helpers ----------------------------
/** Keep last N characters (cheap token guard) */
function tail(text = '', max = 4000) {
  if (!text) return '';
  return text.length <= max ? text : text.slice(text.length - max);
}

/**
 * Format the last N chat messages into a compact string.
 * Accepts entries like { role, content } or { role, message }.
 */
export function formatRecentChat(
  chatLog = [],
  {
    keepLastN = 8,
    charCap = 2000,
    perMsgCap = 400,
    allowRoles = ['user', 'assistant'], // include 'system', 'tool' if you want them
    roleLabels = { user: 'USER', assistant: 'ASSISTANT', system: 'SYSTEM', tool: 'TOOL' },
    redact = false, // simple optional redaction of obvious noise
  } = {}
) {
  if (!Array.isArray(chatLog) || chatLog.length === 0) return '';

  const norm = (m) => {
    const role = String(m?.role || 'user').toLowerCase();
    const raw = (m?.content ?? m?.message ?? '').toString();
    return { role, text: collapseWs(raw) };
  };

  const lines = chatLog
    .filter(Boolean)
    .map(norm)
    .filter((m) => allowRoles.includes(m.role))
    .slice(-keepLastN)
    .map(({ role, text }) => {
      const label = (roleLabels[role] || role || 'user').toUpperCase();
      let t = text.trim();
      if (t.length > perMsgCap) t = t.slice(0, perMsgCap - 1) + '…';
      return `- ${label}: ${t}`;
    });

  if (lines.length === 0) return '';

  // Build from the END to respect charCap without cutting a line in half.
  const acc = [];
  let len = 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    const add = (acc.length === 0 ? 0 : 1) + line.length; // +1 for '\n' if not first
    if (len + add > charCap) break;
    acc.push(line);
    len += add;
  }
  return acc.reverse().join('\n');
}

/** Collapse internal whitespace/newlines to something tidy */
function collapseWs(s) {
  // Replace runs of whitespace/newlines with single spaces, but keep code fences readable
  // (If you need to preserve code blocks, handle them separately.)
  return s.replace(/\s+/g, ' ').trim();
}

/** Lookup question object by name (your JSON shape is [{ "Two Sum": { meta, data }}, ...]) */
function getQuestionByName(name) {
  if (!Array.isArray(questionsJson)) return null;
  const entry = questionsJson.find((e) => Object.keys(e || {})[0] === name);
  return entry ? entry[name] : null; // { meta, data }
}

/** Build a concise question block for prompt */
function formatQuestionBlock(qname, qobj, charCap = 2000) {
  if (!qobj) return `Question: ${qname}\n(Details unavailable)`;
  const title = qobj?.meta?.title || qname;
  const difficulty = qobj?.meta?.difficulty;
  const constraints = qobj?.meta?.constraints || qobj?.meta?.short_constraints;
  const descArr = qobj?.data?.description || [];
  const examples = qobj?.data?.examples || [];

  const desc = Array.isArray(descArr) ? descArr.join('\n') : (descArr || '');
  const exLines = Array.isArray(examples)
    ? examples
        .slice(0, 2)
        .map((ex, i) => {
          const parts = [];
          if (ex?.input) parts.push(`Input: ${ex.input}`);
          if (ex?.output) parts.push(`Output: ${ex.output}`);
          if (ex?.explanation) parts.push(`Explanation: ${ex.explanation}`);
          return `Example ${i + 1}:\n${parts.join('\n')}`;
        })
        .join('\n\n')
    : '';

  let block = `Question: ${title}${difficulty ? ` (${difficulty})` : ''}\n`;
  if (constraints) block += `Constraints: ${constraints}\n`;
  if (desc) block += `\n${desc}\n`;
  if (exLines) block += `\n${exLines}\n`;
  if (block.length > charCap) block = tail(block, charCap);
  return block;
}

/** KEEP: your system prompt function */
export function getSystemPrompt() {
  return `
You are a concise interview assistant.
Use the provided question, recent chat context, and current code.
Be helpful in 1–3 sentences. Avoid giving full solutions unless explicitly asked.
`.trim();
}

// ---------------------- Your existing endpoints ------------------------

// GET /QuestionsMetaData -> list lightweight cards
router.get('/QuestionsMetaData', (_req, res) => {
  try {
    const meta = questionsJson.map((entry) => {
      const name = Object.keys(entry)[0];
      const { meta } = entry[name];
      return { name, ...meta };
    });
  res.json(meta);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// GET /Question/:name -> full problem data
router.get('/Question/:name', (req, res) => {
  const { name } = req.params;
  const entry = questionsJson.find((e) => Object.keys(e)[0] === name);
  if (entry) {
    res.json(entry[name]);
  } else {
    res.status(404).json({ error: 'Question not found' });
  }
});

// ---------------------- New: /richAsk (with session + question) --------
/**
 * POST /richAsk
 * Body: { sessionId: string, prompt: string }
 * - Loads session (code_content, chat_log, question_name) from Supabase
 * - Loads question content from ../Questions/questionsData.json
 * - Sends compact, grounded context to OpenAI
 */
router.post('/richAsk', async (req, res) => {
  try {
    const { sessionId, prompt } = req.body ?? {};
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    // 1) Pull session context from Supabase
    const { data: session, error: selErr } = await supabase
      .from('sessions')
      .select('id, username, question_name, code_content, chat_log')
      .eq('id', sessionId)
      .single();

    if (selErr || !session) {
      return res.status(404).json({ error: 'Session not found', details: selErr });
    }

    const qname = session.question_name || 'unknown-question';
    const code = tail(session.code_content || '', 8000);
    const recentChat = formatRecentChat(session.chat_log || [], 8, 1800);

    // 2) Pull question from JSON (same style as your GET endpoints)
    const qobj = getQuestionByName(qname);
    const questionBlock = formatQuestionBlock(qname, qobj, 2000);

    // 3) Build compact context for the model
    let contextBlock = `${questionBlock}\n`;
    if (recentChat) contextBlock += `\nRecent chat:\n${recentChat}\n`;
    if (code) contextBlock += `\nCurrent code:\n\`\`\`\n${code}\n\`\`\`\n`;
    console.log(`📝 RichAsk context: question=${questionBlock}, chat=${recentChat}, code=${code}`);

    // 4) Call OpenAI
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 220,
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'system', content: contextBlock },
        { role: 'user', content: prompt.trim() },
      ],
    });

    const answer = resp.choices?.[0]?.message?.content?.trim() ?? '';

    return res.json({
      answer,
      sessionId,
      question: qname,
      usage: resp.usage ?? null,
      included: {
        questionBlockChars: questionBlock.length,
        recentChatChars: recentChat.length,
        codeChars: code.length,
      },
    });
  } catch (err) {
    console.error('RichAsk error:', err?.status, err?.message || err);
    return res.status(500).json({ error: 'Failed to call OpenAI (RichAsk)' });
  }
});
router.post('/richReview', async (req, res) => {
  try {
    const { sessionId, categories } = req.body ?? {};
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    // ✅ Do NOT select created_at / updated_at unless they exist
    const { data: session, error: selErr } = await supabase
      .from('sessions')
      .select('id, username, question_name, code_content, chat_log, status')
      .eq('id', sessionId)
      .single();

    if (selErr || !session) {
      return res.status(404).json({ error: 'Session not found', details: selErr });
    }

    const qname = session.question_name || 'unknown-question';
    const code  = tail(session.code_content || '', 12000);

    const recentChat = formatRecentChat(session.chat_log || [], {
      keepLastN: 30,
      charCap: 6000,
      perMsgCap: 600,
      allowRoles: ['user', 'assistant', 'system', 'tool', 'interviwer'], // your custom role
      roleLabels: { user: 'USER', assistant: 'ASSISTANT', interviwer: 'INTERVIEWER', system: 'SYSTEM', tool: 'TOOL' },
    });

    const qobj = getQuestionByName(qname);
    const questionBlock = formatQuestionBlock(qname, qobj, 2500);

    const rubric = Array.isArray(categories) && categories.length
      ? categories
      : [
          'Problem Understanding',
          'Correctness & Edge Cases',
          'Algorithmic Complexity',
          'Code Quality & Readability',
          'Testing Strategy',
          'Communication & Reasoning'
        ];

    let contextBlock = `${questionBlock}\n`;
    if (recentChat) contextBlock += `\nInterview chat (truncated):\n${recentChat}\n`;
    if (code)       contextBlock += `\nCandidate code (truncated):\n\`\`\`\n${code}\n\`\`\`\n`;

    const reviewerSystem = `
You are a senior interview reviewer. Provide a calm, actionable evaluation.
Score each category from 0–10 (decimals allowed). Keep scores consistent with rationale.
Be concise but specific. Avoid revealing full solutions.
Return ONLY valid JSON matching the required schema.
`.trim();

    const userInstruction = `
Review the interview for session "${sessionId}" (user: "${session.username || 'Unknown'}").
Use the context below (question, chat, code).

Categories to grade:
${rubric.map((c,i)=>`${i+1}. ${c}`).join('\n')}

Return STRICT JSON with this structure:
{
  "overall": number,
  "categories": [
    { "name": string, "score": number, "rationale": string }
  ],
  "strengths": [ string, ... ],
  "issues": [ string, ... ],
  "recommendations": [
    { "priority": "high"|"medium"|"low", "action": string }
  ],
  "summary": string
}

Guidelines:
- Base everything ONLY on the provided chat/code/question.
- If code is clearly incomplete, say so and score accordingly.
- If you are unsure, state assumptions.
- Keep all text under 1500 words total.
`.trim();

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: reviewerSystem },
        { role: 'system', content: contextBlock },
        { role: 'user', content: userInstruction },
      ],
      max_tokens: 900,
    });

    const raw = resp.choices?.[0]?.message?.content?.trim() || '{}';
    let reviewJson;
    try {
      reviewJson = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}$/);
      reviewJson = m ? JSON.parse(m[0]) : { error: 'Model did not return valid JSON', raw };
    }

    return res.json({
      sessionId,
      question: qname,
      review: reviewJson,
      rubric,
      usage: resp.usage ?? null,
      included: {
        questionBlockChars: questionBlock.length,
        recentChatChars: recentChat.length,
        codeChars: code.length,
        status: session.status || null,
      },
    });
  } catch (err) {
    console.error('RichReview error:', err?.status, err?.message || err);
    return res.status(500).json({ error: 'Failed to call OpenAI (RichReview)' });
  }
});


export default router;
