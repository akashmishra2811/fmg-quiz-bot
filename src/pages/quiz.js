const { processExcelFile } = require("../../utils/fileUtils");
const fs = require("fs");
const filePath = "src/data/quiz.xlsx";
const axios = require("axios");
let quiz = [];
if (fs.existsSync(filePath)) {
  quiz = processExcelFile(filePath);
  console.log("Processing file...");
} else {
  console.log("File does not exist.");
}

let userProgress = {};
async function handleQuiz(bot, msg) {
  const chatId = msg.chat.id;

  try {
    // 🧠 Ensure quiz is defined
    if (!Array.isArray(quiz) || quiz.length === 0) {
      throw new Error("Quiz data is missing or not initialized");
    }

    const today = new Date().toISOString().split("T")[0];
    const url = "https://script.google.com/macros/s/AKfycbw_Jc5oM0q3yZctHBc6wkZODD3qHW6RRdcOe6sTRStFM6WhicG7lOVOBSZzEoHQohk/exec";
    const payload = {
      title: `fmg-quiz (${today})`,
      questions: quiz,
      chatId: chatId.toString()
    };

    console.log("📤 Sending POST to Google Apps Script:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000  // 30s timeout
    });

    // 🧪 Ensure response is valid
    if (!response || !response.data) {
      throw new Error("No response or malformed response from Google Apps Script");
    }

    const formUrl = response.data.formUrl;
    if (!formUrl) {
      console.error("🔴 Invalid response data:", response.data);
      throw new Error("formUrl missing in response");
    }

    // ✅ Success message to Telegram
    bot.sendMessage(chatId, `📝 Complete the test:\n\n[fmg-test](${formUrl})`, {
      parse_mode: "Markdown"
    });

  } catch (error) {
    console.error("❌ Error creating quiz:", error);

    if (error.response) {
      console.error("🔴 Axios Response Error:", {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error("🕳 No response received from Google Apps Script");
    } else {
      console.error("🧠 Error:", error.message);
    }

    bot.sendMessage(chatId, "❌ Failed to create quiz. Please try again later.");
  }
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
    .slice(2)
    .split("_")
    .map(Number);

  const selectedOption = quiz[questionIndex].options[selectedOptionIndex];
  
  // Update the user's answer in progress
  userProgress[chatId].answers[questionIndex] = selectedOption;

  // Modify the inline buttons to reflect the updated answer
  const options = quiz[questionIndex].options.map((option, i) => [
    {
      text: i === selectedOptionIndex ? `🟡 ${option}` : option,
      callback_data: `Q_${questionIndex}_${i}_set`
    }
  ]);

  bot.editMessageText(
    `❓ *${quiz[questionIndex].question}*`,
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

    resultMessage += ` *${q.question}*\nYour Answer: ${userAnswer}\n✅ Correct Answer: ${q.answer}\n🟡 Your Answer :${userAnswer} \n\n`;
    if (correct) user.score++;
  });

  resultMessage += `🎯 *Final Score:* ${user.score} / ${quiz.length}`;
  bot.sendMessage(chatId, resultMessage, { parse_mode: "Markdown" });

  delete userProgress[chatId];
}

module.exports = { handleQuiz, handleCallbackQuery };
