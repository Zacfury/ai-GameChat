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
        model: "mistralai/mistral-7b-instruct:free",  // You can try other models like mythomax, mistral-7b-instruct etc.
        messages: [{ role: "user", content: message }]
      },
      {
        headers: {
          "Authorization": `Bearer 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`,
          "HTTP-Referer": "https://ai-gamechat-production.up.railway.app", // required by OpenRouter
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Loaded API Key:", process.env.OPENROUTER_API_KEY);
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
