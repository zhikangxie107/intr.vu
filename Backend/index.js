import express from "express";
import path from "path";
import dotenv from "dotenv";
import OpenAIrouter from "./OpenAi/test.js";
import ElevenLabsrouter from "./ElevenLabs/tts.js";
import whisperRoute from "./WhisperAi/whisper.js";
import questionsRouter from "./Questions/questions.js";
import SessionRouter from "./InterviewSession/Session.js";


dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5050;

app.use(express.json());

 

// mount router at /api
app.use("/api", OpenAIrouter);
app.use("/api/tts", ElevenLabsrouter);
app.use("/api/whisper", whisperRoute);
app.use("/api/questions", questionsRouter);
app.use("/api/session", SessionRouter);


app.get("/", (_req, res) => {
  res.send("Hello from Express!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
