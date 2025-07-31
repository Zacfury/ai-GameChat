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
        model: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",  // You can try other models like mythomax, mistral-7b-instruct etc.
        messages: [{ role: "user", content: message }]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000", // required by OpenRouter
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    console.error("❌ OpenRouter API Error:", err.response?.data || err.message);
    res.status(500).json({ error: "OpenRouter API error", detail: err.message });
  }
});

app.listen(3000, () => {
  console.log("🚀 AI server running via OpenRouter at http://localhost:3000");
});
