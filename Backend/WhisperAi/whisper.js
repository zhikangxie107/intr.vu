import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs";
import { execSync } from "child_process";
import FormData from "form-data";

dotenv.config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  const audioFile = req.file;

  if (!audioFile) {
    console.error("❌ No file uploaded");
    return res.status(400).send("No file uploaded");
  }

  const inputPath = audioFile.path;
  const outputPath = `${inputPath}.mp3`; // Convert to mp3

  try {
    // Convert .webm → .mp3 using ffmpeg
    execSync(`ffmpeg -i ${inputPath} -ar 44100 -ac 1 -b:a 192k ${outputPath}`);

    const formData = new FormData();
    formData.append("file", fs.createReadStream(outputPath));
    formData.append("model", "whisper-1");
    //formData.append("language", "en");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const data = await response.json();
    console.log("🧠 OpenAI Whisper response:", data);

    // Clean up both original and converted files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    if (data.text) {
      res.json({ text: data.text });
    } else {
      res.status(500).json({ error: "No transcription received." });
    }
  } catch (error) {
    console.error("❌ Whisper error:", error);
    res.status(500).send("Transcription failed.");
  }
});

export default router;
