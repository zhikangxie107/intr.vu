// questions.js (ESM)
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// __dirname replacement in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust the path if your JSON lives elsewhere
const questionsPath = path.join(__dirname, "questionsData.json");

// Read & parse once at module load
let questions = [];
try {
  const raw = fs.readFileSync(questionsPath, "utf-8");
  questions = JSON.parse(raw);
  console.log("Loaded questions:", questions.length);
} catch (err) {
  console.error("Failed to load questionData.json:", err);
  // Optional: throw to fail fast, or keep empty array
}

// GET /QuestionsMetaData -> list lightweight cards
router.get("/QuestionsMetaData", (_req, res) => {
  try {
    const meta = questions.map((entry) => {
      const name = Object.keys(entry)[0];
      const { meta } = entry[name];
      return { name, ...meta };
    });
    res.json(meta);
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// GET /Question/:name -> full problem data
router.get("/Question/:name", (req, res) => {
  const { name } = req.params;
  const question = questions.find((entry) => Object.keys(entry)[0] === name);
  if (question) {
    res.json(question[name]);
  } else {
    res.status(404).json({ error: "Question not found" });
  }
});

export default router;
