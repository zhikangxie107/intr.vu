import express from "express";
import path from "path";
import dotenv from "dotenv";
import OpenAIrouter from "./OpenAi/test.js";
import ElevenLabsrouter from "./ElevenLabs/tts.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(express.json());
//cors middleware
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, Content-Length, X-Requested-With"
//   );
//   next();
// });


// mount router at /api
app.use("/api", OpenAIrouter);
app.use("/api/tts", ElevenLabsrouter);

app.get("/", (_req, res) => {
  res.send("Hello from Express!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
