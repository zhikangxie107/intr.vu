import express from "express";
import path from "path";
import dotenv from "dotenv";
import OpenAIrouter from "./OpenAi/test.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(express.json());

// mount router at /api
app.use("/api", OpenAIrouter);

app.get("/", (_req, res) => {
  res.send("Hello from Express!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
