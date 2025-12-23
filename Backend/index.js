import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

const app = express();

// ---------- CORS ----------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ❌ REMOVE THIS
// app.options("*", cors());

app.use(express.json());

// ---------- OPENAI ----------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------- Emotion Logic ----------
const detectEmotion = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes("haha") || lower.includes("fun") || lower.includes("lol"))
    return "teasing";
  if (lower.includes("angry") || lower.includes("mad")) return "angry";
  if (lower.includes("sad") || lower.includes("sorry")) return "sad";
  if (lower.includes("thank") || lower.includes("nice") || lower.includes("great"))
    return "happy";
  return "serious";
};

// ---------- TEST ROUTES ----------
app.get("/", (req, res) => {
  res.send("AionX Backend Running 🚀");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ---------- CHAT ROUTE ----------
app.post("/chat", async (req, res) => {
  try {
    const { message, character } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required." });
    }

    const characters = {
      gojo:
        "You are Gojo Satoru — confident, witty, playful but wise. Reply naturally.",
      levi:
        "You are Levi Ackerman — calm, stoic, disciplined, short replies, serious tone.",
      elsa:
        "You are Elsa — warm, emotional, kind, graceful with comforting tone.",
    };

    const systemPrompt =
      characters[character?.toLowerCase()] ||
      "You are a friendly anime character chatting casually.";

    const emotion = detectEmotion(message);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${systemPrompt} Match tone closer to ${emotion} when relevant.`,
        },
        { role: "user", content: message },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "Hmm... I didn't quite get that.";

    res.json({ reply, emotion });
  } catch (err) {
    console.error("OpenAI Error:", err?.message || err);
    res.status(500).json({
      error: "Backend error occurred.",
      details: err?.message || "Unknown error",
    });
  }
});

// ---------- SERVER ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
