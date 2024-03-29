const winston = require("winston");
const path = require("path");

const { createLogger, transports } = require("winston"); 
const process = require("process");

const { combine, timestamp, label, printf } = winston.format;

const logFormat = printf(({ level, message, label, timestamp }) => {

  return `${timestamp} [${label}] ${level}: ${message}`; 
});

// logger 생성
const logger = createLogger({
    format: combine(label({ label: "THE_FINALS_CNS" }), timestamp(), logFormat),
    transports: [
        new transports.Console()
    ],
});

module.exports = logger;