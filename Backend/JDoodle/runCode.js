export default async function runCode(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { script, language, versionIndex, stdin } = req.body;

  try {
    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script,
        language,
        versionIndex,
        stdin: stdin || "",
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "JDoodle execution failed" });
  }
}