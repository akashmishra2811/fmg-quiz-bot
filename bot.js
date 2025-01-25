

require('dotenv').config();

const TOKEN = process.env.TELEGRAM_TOKEN;  
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(TOKEN, { polling: true });

// Quiz Questions
const quiz = [
  { question: "What is the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome"], answer: "Mitochondria" },
  { question: "What is the chemical symbol for water?", options: ["H2O", "O2", "CO2"], answer: "H2O" },
  { question: "How many bones are in the human body?", options: ["206", "205", "210"], answer: "206" }
];

// Track user progress
let userProgress = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Welcome to the Quiz Bot! Type /quiz to start.");
});

bot.onText(/\/quiz/, (msg) => {
  const chatId = msg.chat.id;
  userProgress[chatId] = { score: 0, index: 0, answers: [] };
  sendQuestion(chatId);
});

function sendQuestion(chatId) {
  let user = userProgress[chatId];

  if (user.index < quiz.length) {
    let q = quiz[user.index];
    const options = {
      reply_markup: {
        keyboard: [q.options.map(option => ({ text: option }))],
        one_time_keyboard: true,
      }
    };
    bot.sendMessage(chatId, q.question, options);
  } else {
    showResults(chatId);
  }
}

function showResults(chatId) {
  let user = userProgress[chatId];
  let correctAnswers = 0;
  let resultMessage = "📊 Quiz Results:\n\n";

  quiz.forEach((q, i) => {
    let userAnswer = user.answers[i] || "No answer";
    let correct = userAnswer === q.answer;
    if (correct) correctAnswers++;

    resultMessage += `❓ ${q.question}\nYour Answer: ${userAnswer}\n✅ Correct Answer: ${q.answer}\n\n`;
  });

  resultMessage += `🎯 Final Score: ${correctAnswers} / ${quiz.length}`;
  bot.sendMessage(chatId, resultMessage);
  delete userProgress[chatId]; // Reset for next time
}

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  let user = userProgress[chatId];

  if (user && user.index < quiz.length) {
    user.answers.push(msg.text);
    user.index++;
    setTimeout(() => sendQuestion(chatId), 1000);
  }
});

console.log("Quiz Bot is running...");
