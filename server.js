const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/ask', async (req, res) => {
  const message = req.body.message;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "mistralai/mistral-7b-instruct:free",
        messages: [{ role: "user", content: message }]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://194.238.18.15",  // ✅ your VPS IP, plain HTTP
          "Content-Type": "application/json"
        }
      }
    );
    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    console.error("❌ OpenRouter API Error:", err.response?.data || err.message);
    res.status(500).json({ error: "OpenRouter API error", detail: err.message });
  }

  console.log("📝 Prompt:", message);
  console.log("🔑 API Key present:", !!process.env.OPENROUTER_API_KEY);
});

app.listen(3000, () => {
  console.log("🚀 AI server running via OpenRouter at http://localhost:3000");
});
