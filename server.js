import express from "express";
import "dotenv/config";
import { orchestrate } from "./orchestrator.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'question' field" });
  }

  try {
    const result = await orchestrate(question);
    if (result.success) {
      res.json({
        answer: result.text,
        cost: result.cost,
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (err) {
    console.error("Error processing question:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Orchestrator API listening on http://localhost:${PORT}`);
  console.log(`  POST /ask   — { "question": "..." }`);
  console.log(`  GET  /health`);
});
