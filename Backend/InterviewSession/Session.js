// routes/sessions.js
import 'dotenv/config';
import { Router } from 'express';
import { supabase } from '../supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/createSession', async (req, res) => {
  try {
    const { username, questionName } = req.body;
    if (!username || !questionName) {
      return res.status(400).json({ error: 'username and questionName are required' });
    }

    // 1) Try to find an existing ACTIVE/PAUSED session for this user+question
    const { data: existing, error: selErr } = await supabase
      .from('sessions')
      .select('*')
      .eq('username', username)
      .eq('question_name', questionName)   // ✅ correct column name
      .in('status', ['ACTIVE', 'PAUSED'])  // ✅ enum values
      .limit(1);

    if (selErr) {
      console.error('Select error:', selErr);
      return res.status(500).json({ error: 'Database error (select)' });
    }

    if (existing && existing.length > 0) {
      return res.status(200).json(existing[0]);
    }

    // 2) Create a new session
    const newSession = {
      id: uuidv4(),
      username,
      status: 'ACTIVE',            // ✅ correct enum
      question_name: questionName, // ✅ correct column name
      code_content: '',            // start empty
      chat_log: []                 // jsonb array
    };

    const { data: inserted, error: insErr } = await supabase
      .from('sessions')
      .insert(newSession)
      .select()
      .single();

    if (insErr) {
      console.error('Insert error:', insErr);
      return res.status(500).json({ error: 'Database error (insert)' });
    }

    return res.status(201).json(inserted);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});


/**
 * POST /completeSession
 * Body: { sessionId }  (preferred)
 *  —or— { username, questionName }  (fallback)
 * Effect: sets status='COMPLETED' and returns the updated row.
 */
router.post('/completeSession', async (req, res) => {
  try {
    const { sessionId, username, questionName } = req.body || {};

    if (!sessionId && !(username && questionName)) {
      return res.status(400).json({ error: 'Provide sessionId OR (username and questionName).' });
    }

    let match = supabase.from('sessions').select('id,status,username,question_name').limit(1);

    if (sessionId) {
      match = match.eq('id', sessionId);
    } else {
      match = match.eq('username', username).eq('question_name', questionName);
    }

    const { data: found, error: findErr } = await match.single();
    if (findErr) {
      // Not found or other db error
      const code = findErr.code === 'PGRST116' ? 404 : 500; // PGRST116 = no rows
      return res.status(code).json({ error: code === 404 ? 'Session not found' : 'Database error (lookup)', details: findErr });
    }

    if (found.status === 'COMPLETED') {
      // Idempotent completion
      return res.status(200).json(found);
    }

    const { data: updated, error: updErr } = await supabase
      .from('sessions')
      .update({ status: 'COMPLETED' }) // enum value must be uppercase
      .eq('id', found.id)
      .select()
      .single();

    if (updErr) {
      return res.status(500).json({ error: 'Database error (update)', details: updErr });
    }

    return res.status(200).json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

/**
 * DELETE /session/:id
 * Path: :id = session UUID
 * Effect: hard-deletes a session, but ONLY if status='COMPLETED'.
 * (Safer; avoids nuking active interviews by accident.)
 */
router.delete('/session/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure it exists, and only allow delete when COMPLETED
    const { data: s, error: getErr } = await supabase
      .from('sessions')
      .select('id,status,username,question_name')
      .eq('id', id)
      .single();

    if (getErr) {
      const code = getErr.code === 'PGRST116' ? 404 : 500;
      return res.status(code).json({ error: code === 404 ? 'Session not found' : 'Database error (lookup)', details: getErr });
    }

    if (s.status !== 'COMPLETED') {
      return res.status(409).json({ error: 'Session must be COMPLETED before deletion.' });
    }

    const { data: deleted, error: delErr } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (delErr) {
      return res.status(500).json({ error: 'Database error (delete)', details: delErr });
    }

    return res.status(200).json({ ok: true, deleted });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

router.get("/getSession/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { data: session, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            const code = error.code === 'PGRST116' ? 404 : 500;
            return res.status(code).json({ error: code === 404 ? 'Session not found' : 'Database error (lookup)', details: error });
        }
        return res.status(200).json(session);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Unexpected server error' });
    }
});

router.post("/uploadCode", async (req, res) => {
  try {
    const { sessionId, codeContent } = req.body;
    if (!sessionId || typeof codeContent !== 'string') {
      return res.status(400).json({ error: 'sessionId and codeContent are required' });
    }
    const { data: updated, error: updErr } = await supabase
        .from('sessions')
        .update({ code_content: codeContent })
        .eq('id', sessionId)
        .select()
        .single();
    if (updErr) {
      console.error('Update error:', updErr);
      return res.status(500).json({ error: 'Database error (update)' });
    }
    return res.status(200).json(updated);
    } catch (e) {
      console.error('Unexpected error:', e);
      return res.status(500).json({ error: 'Unexpected server error' });
    }
});

router.post("/appendChat", async (req, res) => {
  try {
    const { sessionId, prompt, response } = req.body;
    if (!sessionId || !prompt || !response) {
      return res.status(400).json({ error: "sessionId, prompt, and response are required" });
    }

    // Normalize roles (fix typos like "interviwer" -> "assistant")
    const normRole = (r) => {
      const s = String(r || "").toLowerCase();
      if (s === "user") return "user";
      // treat anything else as assistant
      return "assistant";
    };

    const userEntry = {
      role: normRole(prompt.role || "user"),
      content: String(prompt.content ?? "").trim(),
    };

    const assistantEntry = {
      role: normRole(response.role || "assistant"), // will normalize "interviwer"
      content: String(response.content ?? "").trim(),
    };

    // Fetch existing chat_log
    const { data: session, error: selErr } = await supabase
      .from("sessions")
      .select("chat_log")
      .eq("id", sessionId)
      .single();

    if (selErr) {
      console.error("Select error:", selErr);
      return res.status(500).json({ error: "Database error (select)" });
    }

    const updatedChatLog = Array.isArray(session?.chat_log) ? session.chat_log.slice() : [];
    updatedChatLog.push(userEntry, assistantEntry); // <-- push two flat entries

    const { data: updated, error: updErr } = await supabase
      .from("sessions")
      .update({ chat_log: updatedChatLog })
      .eq("id", sessionId)
      .select()
      .single();

    if (updErr) {
      console.error("Update error:", updErr);
      return res.status(500).json({ error: "Database error (update)" });
    }
    return res.status(200).json(updated);
  } catch (e) {
    console.error("Unexpected error:", e);
    return res.status(500).json({ error: "Unexpected server error" });
  }
});

export default router;


// delete session
// when question is complete, delete session

// chat loop
// every 45 seconds frontend will call this endpoint with current code + chat log
// interviwer will ask questions based on code + chat log
