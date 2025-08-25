const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

/**
 * ROUTE 1: Just AI text reply (no voice)
 * POST /ask
 * Body: { message: "Hello AI" }
 */
app.post("/ask", async (req, res) => {
  const message = req.body.message;

  try {
    const response = await axios.post(
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

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("❌ OpenRouter API Error:", err.response?.data || err.message);
    res.status(500).json({ error: "AI error", detail: err.message });
  }
});

/**
 * ROUTE 2: AI text + TTS
 * POST /ask_and_tts
 * Body: { message: "Hello AI" }
 */
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

    // 2. Convert reply text to speech (OpenAI TTS)
    const ttsRes = await axios.post(
      "https://api.openai.com/v1/audio/speech",
      {
        model: "gpt-4o-mini-tts",
        voice: "alloy", // available: alloy, verse, shimmer, etc
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

    // 3. Convert binary audio → base64
    const audioBase64 = Buffer.from(ttsRes.data, "binary").toString("base64");

    // 4. Return both text and audio
    res.json({ text: reply, audio: audioBase64 });

  } catch (err) {
    console.error("❌ AI+TTS Error:", err.response?.data || err.message);
    res.status(500).json({ error: "AI+TTS failed", detail: err.message });
  }
});

/**
 * Start server
 */
app.listen(3000, "0.0.0.0", () => {
  console.log("🚀 AI server running at http://0.0.0.0:3000");
});
