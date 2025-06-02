const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const fetch = require('node-fetch');

// Download file from URL and save locally
const downloadFile = async (url, dest) => {
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(dest);
  return new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
};

// Process the .xlsx file and return formatted data
const processExcelFile = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Transform the data into the desired format
    const formattedData = data.slice(1).map((row) => ({
      question: row[0] || "",
      options: [row[1] || "", row[2] || "", row[3] || "", row[4] || ""].filter(Boolean),
      correctAnswer: row[7] === 'multiple' ? (row[5] ? row[5].split(',').map(answer => answer.trim()) : []) : (row[5] || ""),
      explain: row[6] || "",
      type: row[7] === 'multiple'? "multiple" : "single",
      imageUrl: row[8] || "",
    }));

    return formattedData;
  } catch (error) {
    console.error("Error processing file:", error);
    throw new Error("Failed to process the Excel file.");
  }
};

module.exports = { downloadFile, processExcelFile };

