const TelegramBot = require('node-telegram-bot-api');
const { TOKEN, superUserList } = require('./config');
const { handleQuiz, handleCallbackQuery } = require('./src/pages/quiz');
const { processFile } = require('./src/pages/processFile');
const {quizScheduler, handleScheduledCallbackQuery} = require('./src/pages/quizScheduler');
const express = require('express');
const axios = require('axios');
const bot = new TelegramBot(TOKEN, { polling: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('FMG Quiz Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});
bot.onText(/\/start/, (msg) => {
  
  bot.sendMessage(msg.chat.id, "Bot is starting... Please wait.⏳");
  axios.get('https://fmg-quiz-bot.onrender.com/')
    .then(response => {
      console.log("Successfully hit the endpoint:", response.data);
      bot.sendMessage(msg.chat.id, "Welcome! 🎉 The bot is up and running. Type /help to explore available commands and get started.");
    })
    .catch(error => {
      console.error("Error hitting the endpoint:", error.message);
      bot.sendMessage(msg.chat.id, "There was an error starting the bot. Please try again later.");
    });
});

bot.onText(/\/test/, (msg) => {
  handleQuiz(bot, msg);
});

bot.onText(/\/question/, (msg) => {
  quizScheduler(bot);
});

function handleCallbackQueryType(bot, callbackQuery) {
  const data = callbackQuery.data;
  if (data.endsWith("_set")) {
    handleCallbackQuery(bot, callbackQuery); // Handle quiz answers
  }else if (data.endsWith("_scheduler")) {
    handleScheduledCallbackQuery(bot, callbackQuery); // Handle scheduled callbacks
  }
}

bot.onText(/\/help/, async (msg) => {
  const helpText = `
👋 Welcome to the *FMG Test Bot*! 🎉  
This bot allows you to take exciting Test and improve your knowledge. 🧠✨  
📅 *Every day*, a new Test will be posted for you to practice!  

Here are some commands you can use:  
🚀 /start - Start the bot and begin your journey  
📝 /test - Start a Test 
❓ /help - Show this help message  

Have fun and good luck! 🍀  
`;
  bot.sendMessage(msg.chat.id, helpText);
});

bot.on("callback_query", (callbackQuery) => {
  handleCallbackQueryType(bot, callbackQuery);
});


bot.on('document', async (msg) => {
  processFile(bot, msg);
});

console.log("Bot is running...");
