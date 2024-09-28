const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Hard-coded token (not recommended for security reasons)
const TELEGRAM_BOT_TOKEN = '5033924614:AAFo2h984fAi_aadSArV692OwSEUq69Xbcw';

let botRunning = false;
let intervalId = null;
let chatId = null;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/start', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (botRunning) {
    return res.status(400).json({ error: 'Bot is already running' });
  }

  try {
    chatId = await getChatId(TELEGRAM_BOT_TOKEN);
    if (!chatId) {
      throw new Error('Could not get chat ID. Make sure to send a message to your bot first.');
    }

    botRunning = true;
    intervalId = setInterval(() => makeRequest(url, TELEGRAM_BOT_TOKEN), 5000);
    res.json({ status: 'Bot started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/stop', (req, res) => {
  if (!botRunning) {
    return res.status(400).json({ error: 'Bot is not running' });
  }

  clearInterval(intervalId);
  botRunning = false;
  res.json({ status: 'Bot stopped' });
});

async function makeRequest(url, token) {
  try {
    const response = await axios.get(url);
    const data = response.data;
    console.log(`Request to ${url} successful:`, data);
    await sendTelegramMessage(token, `Request to ${url} successful. Response: ${JSON.stringify(data).substring(0, 100)}...`);
  } catch (error) {
    console.error(`Error making request to ${url}:`, error.message);
    await sendTelegramMessage(token, `Error making request to ${url}: ${error.message}`);
  }
}

async function sendTelegramMessage(token, message) {
  const telegramApi = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    await axios.post(telegramApi, {
      chat_id: chatId,
      text: message,
    });
    console.log('Message sent to Telegram');
  } catch (error) {
    console.error('Error sending message to Telegram:', error.message);
  }
}

async function getChatId(token) {
  const telegramApi = `https://api.telegram.org/bot${token}/getUpdates`;
  try {
    const response = await axios.get(telegramApi);
    const data = response.data;
    if (data.result.length > 0) {
      return data.result[0].message.chat.id;
    } else {
      throw new Error('No chat found. Make sure to send a message to your bot first.');
    }
  } catch (error) {
    console.error('Error getting chat ID:', error.message);
    throw error;
  }
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
