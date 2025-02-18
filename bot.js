const TelegramBot = require('node-telegram-bot-api');
const { TOKEN, superUserList } = require('./config');
const { handleQuiz, handleCallbackQuery } = require('./src/pages/quiz');
const { processFile } = require('./src/pages/processFile');
const {quizScheduler, handleScheduledCallbackQuery} = require('./src/pages/quizScheduler');
const bot = new TelegramBot(TOKEN, { polling: true });

quizScheduler(bot);

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome to the Quiz Bot! Type /quiz to start.");
});

bot.onText(/\/quiz/, (msg) => {
  handleQuiz(bot, msg);
});

function handleCallbackQueryType(bot, callbackQuery) {
  const data = callbackQuery.data;
  if (data.endsWith("_set")) {
    handleCallbackQuery(bot, callbackQuery); // Handle quiz answers
  }else if (data.endsWith("_scheduler")) {
    handleScheduledCallbackQuery(bot, callbackQuery); // Handle scheduled callbacks
  }
}

bot.on("callback_query", (callbackQuery) => {
  handleCallbackQueryType(bot, callbackQuery);
});


bot.on('document', async (msg) => {
  processFile(bot, msg);
});



console.log("Bot is running...");
