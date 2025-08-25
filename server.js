const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// existing /ask remains the same

// NEW: ask + TTS
app.post("/ask_and_tts", async (req, res) => {
  const message = req.body.message;

  try {
    // 1. Get AI text
    const aiRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: message }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    const reply = aiRes.data.choices[0].message.content;

    // 2. Convert to speech (OpenAI TTS example)
    const ttsRes = await axios.post(
      "https://api.openai.com/v1/audio/speech",
      {
        model: "gpt-4o-mini-tts",
        voice: "alloy", // change to your preferred voice
        input: reply,
        format: "ogg"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    // 3. Send both text + base64 audio back
    const audioBase64 = Buffer.from(ttsRes.data, "binary").toString("base64");
    res.json({ text: reply, audio: audioBase64 });
  } catch (err) {
    console.error("❌ AI+TTS Error:", err.response?.data || err.message);
    res.status(500).json({ error: "AI+TTS failed" });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("🚀 AI server running at :3000");
});
