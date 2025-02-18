const { processExcelFile } = require("../../utils/fileUtils");
const fs = require("fs");
const filePath = "src/data/quiz.xlsx";

let quiz = [];
if (fs.existsSync(filePath)) {
  quiz = processExcelFile(filePath);
  console.log("Processing file...");
} else {
  console.log("File does not exist.");
}

let userProgress = {};

function handleQuiz(bot, msg) {
  const chatId = msg.chat.id;

  userProgress[chatId] = { score: 0, answers: Array(quiz.length).fill(null) };

  quiz.forEach((q, index) => {
    // Each option in a separate row (column layout)
    const options = q.options.map((option, i) => [
      {
        text: option,
        callback_data: `Q_${index}_${i}_set`
      }
    ]);

    bot.sendMessage(chatId, `❓ *${q.question}*`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: options }
    });
  });


}

function handleCallbackQuery(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data
  if (data === "submit_test_set") {
    // Submit the test and show results
    showResults(bot, chatId);
    return; // Prevent further processing of answer callback
  }

  const [questionIndex, selectedOptionIndex] = data
    .slice(1)
    .split("_")
    .map(Number);

  const selectedOption = quiz[questionIndex].options[selectedOptionIndex];
  
  // Update the user's answer in progress
  userProgress[chatId].answers[questionIndex] = selectedOption;

  // Modify the inline buttons to reflect the updated answer
  const options = quiz[questionIndex].options.map((option, i) => [
    {
      text: i === selectedOptionIndex ? `✅ ${option}` : option,
      callback_data: `Q_${index}_${i}_set`
    }
  ]);

  bot.editMessageText(
    `❓ *${quiz[questionIndex].question}*\n\n✅ Your Answer: ${selectedOption}`,
    {
      chat_id: chatId,
      message_id: callbackQuery.message.message_id,
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: options }
    }
  );

  bot.answerCallbackQuery(callbackQuery.id);

  // Check if all questions have been answered
  if (userProgress[chatId].answers.every((answer) => answer !== null)) {
    // Only show Submit button once all answers are selected
    const submitButton = {
      text: "Submit Test",
      callback_data: "submit_test_set"
    };

    bot.sendMessage(chatId, "📝 All questions answered! You can now submit the test.", {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: [[submitButton]] }
    });
  }
}

function showResults(bot, chatId) {
  const user = userProgress[chatId];
  let resultMessage = "📊 *Quiz Results:*\n\n";

  quiz.forEach((q, i) => {
    const userAnswer = user.answers[i] || "No Answer";
    const correct = userAnswer === q.answer;

    resultMessage += `❓ *${q.question}*\nYour Answer: ${userAnswer}\n✅ Correct Answer: ${q.answer}\n\n`;
    if (correct) user.score++;
  });

  resultMessage += `🎯 *Final Score:* ${user.score} / ${quiz.length}`;
  bot.sendMessage(chatId, resultMessage, { parse_mode: "Markdown" });

  delete userProgress[chatId];
}

module.exports = { handleQuiz, handleCallbackQuery };
