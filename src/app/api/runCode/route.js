// src/app/api/runCode/route.js
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { script, language, versionIndex, stdin } = await req.json();

    if (!script || !language || typeof versionIndex === 'undefined') {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return Response.json({ error: 'JDoodle credentials not set' }, { status: 500 });
    }

    const jdRes = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        clientSecret,
        script,
        language,
        versionIndex: String(versionIndex),
        stdin: stdin || '',
      }),
    });

    const data = await jdRes.json();
    return new Response(JSON.stringify(data), {
      status: jdRes.ok ? 200 : jdRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return Response.json({ error: e.message || 'JDoodle execution failed' }, { status: 500 });
  }
}
