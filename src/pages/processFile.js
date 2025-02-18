const fs = require("fs");
const path = require("path");
const { TOKEN, superUserList } = require('../../config');
const { downloadFile, processExcelFile } = require("../../utils/fileUtils")
async function processFile (bot,msg){
        const chatId = msg.chat.id;
      
        // Check if the message contains a document (file upload)
        if (msg.document) {
          const fileId = msg.document.file_id;
      
          // Ensure the file is an Excel file
          if (!msg.document.file_name.endsWith(".xlsx")) {
            bot.sendMessage(chatId, "Please upload a valid .xlsx file.");
            return;
          }
      
          try {
            // Get the file path from Telegram
            const file = await bot.getFile(fileId);
            const filePath = file.file_path;
            // Define local file path
            const fileName = document.file_name.split('.')[0]
            let localFilePath = path.join(`${__dirname}/data`, "quiz.xlsx");
            if(fileName=== 'questions'){
              localFilePath =  path.join(`${__dirname}/data`, "questions.xlsx");
            }
               
            // Download the file
            const downloadUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;
            await downloadFile(downloadUrl, localFilePath);
       
          } catch (error) {
            console.error("Error processing file:", error);
            bot.sendMessage(chatId, "Failed to process the file. Please try again.");
          }
        } else {
          bot.sendMessage(
            chatId,
            "Please send me an Excel (.xlsx) file to process. 😊"
          );
        }
      
}

module.exports = { processFile };
