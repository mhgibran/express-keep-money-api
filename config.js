require("dotenv").config();
module.exports = {
  env: process.APP_ENV || "development",
  port: process.APP_PORT || 3001,
};
