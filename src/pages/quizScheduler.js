const fs = require("fs");
const { processExcelFile } = require("../../utils/fileUtils");
const { CHANNEL_ID } = require("../../config");
const { Utility } = require("../../utils/Utility");
const cron = require("node-cron");

let quiz = [];
const filePath = "src/data/questions.xlsx";
if (fs.existsSync(filePath)) {
    quiz = processExcelFile(filePath);
    console.log("Processing file...");
  } else {
    console.log("File does not exist.");
  }
async function quizScheduler(bot) {
 


  const channelId = CHANNEL_ID;
  
  // Function to send questions with inline options to the channel
  function sendQuestion(index) {
    if (index >= quiz.length) {
      console.log("All questions sent!");
      return;
    }
  
    const question = quiz[index];
    
    // Create the options in individual rows (single column)
    const options = question.options.map((option, i) => ([
      {
        text: option,
        callback_data: `Q_${index}_${i}_scheduler`, // Identifying each option for later processing
      }
    ]));
  
    const questionText = `❓ *${question.question}*\n`;
  
    bot.sendMessage(channelId, questionText, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: options } // options are now arranged in separate rows
    });
  
    console.log(`Sent question ${index + 1}`);
  }
  

  function isValid() {
    if (Utility.isEmpty(channelId)) {
      return false;
    }

    return true;
  }

  // Schedule sending questions every minute (you can change this interval)
  let questionIndex = 0;
  if (isValid()) {
    cron.schedule("*/1 * * * *", () => {
      // Every minute
      sendQuestion(questionIndex);
      questionIndex++;

      if (questionIndex >= quiz.length) {
        console.log("All questions sent!");
        return; // Stop the cron job after all questions are sent
      }
    });
  } else {
    console.log("Everything is not valid to schedule");
  }
}

// This function will handle the responses for the scheduled quiz
function handleScheduledCallbackQuery(bot, callbackQuery) {
   
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    let userProgress = {};
    userProgress[chatId] = { score: 0, answers: Array(quiz.length).fill(null) };
  
    // Extract question index and selected option index
    const [,questionIndex, selectedOptionIndex,] = data.split('_').map(Number);
  
    const selectedOption = quiz[questionIndex].options[selectedOptionIndex];
    const correctAnswer = quiz[questionIndex].answer;
  
    // Update the user's answer in progress
    userProgress[chatId].answers[questionIndex] = selectedOption;
  
    // Mark the selected answer and the correct answer
    const selectedAnswer = selectedOption;
    const isCorrect = selectedAnswer === correctAnswer;
  
    // Modify the inline buttons to reflect the updated answer
    const options = quiz[questionIndex].options.map((option, i) => [
      {
        text: i === selectedOptionIndex ? `✅ ${option}` : option,
        callback_data: `Q_${questionIndex}_${i}_scheduler`,
      }
    ]);
  
    bot.editMessageText(
      `❓ *${quiz[questionIndex].question}*\n\nYour Answer: ${selectedAnswer}\nCorrect Answer: ${correctAnswer}\n${isCorrect ? "✅ Correct!" : "❌ Incorrect!"}`,
      {
        chat_id: chatId,
        message_id: callbackQuery.message.message_id,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: options }
      }
    );
  
    bot.answerCallbackQuery(callbackQuery.id);

  }
  

module.exports = { quizScheduler, handleScheduledCallbackQuery };
