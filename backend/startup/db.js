const mongoose = require("mongoose");
const config = require("config");
const { logger } = require("../startup/logging");

module.exports = function() {
  const db = config.get("db");
  mongoose.connect(db).then(() => logger.info(`Connected to ${db}...`));
};
