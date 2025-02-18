require('dotenv').config();

module.exports = {
  TOKEN: process.env.TELEGRAM_TOKEN,
  superUserList: ['905242048'],
  CHANNEL_ID : process.env.CHANNEL_ID,
};
