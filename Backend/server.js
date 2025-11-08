// Backend/server.js
import express from "express";
import whisperRoute from "./routes/whisper.js";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());
app.use("/api/whisper", whisperRoute);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
