import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Simple emotion detection logic (mirrors frontend tone system)
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

// 🧩 Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message, character } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message content is required." });
    }

    // 💬 Define personality prompt for each anime character
    const characters = {
      gojo: "You are Gojo Satoru — a confident, witty, and slightly teasing sorcerer. You enjoy joking around but are wise underneath.",
      levi: "You are Levi Ackerman — stoic, disciplined, and direct. Keep responses short, calm, and focused.",
      elsa: "You are Elsa from Frozen — graceful, kind, and emotionally intelligent. Speak with warmth and elegance.",
    };

    // Default fallback
    const systemPrompt =
      characters[character?.toLowerCase()] ||
      "You are a friendly anime character chatting casually with the user.";

    // 💡 Detect emotion for backend-side awareness
    const emotion = detectEmotion(message);

    // 🧠 Generate response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `${systemPrompt} Adjust your tone to match a ${emotion} emotion if relevant.` },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content || "Hmm... I didn’t quite get that.";

    // Return both reply + emotion (so frontend can use emotion if needed)
    res.json({ reply, emotion });
  } catch (err) {
    console.error("OpenAI Error:", err);
    res.status(500).json({ error: "Error generating reply. Please try again later." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
