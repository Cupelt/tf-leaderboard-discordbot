const winston = require("winston");
const winstonDaily = require("winston-daily-rotate-file"); 
const path = require("path");

const { createLogger, transports } = require("winston"); 
const process = require("process");

const logDir = `${path.join(__dirname, '..')}/logs`;

const { combine, timestamp, label, printf } = winston.format;



const logFormat = printf(({ level, message, label, timestamp }) => {

  return `${timestamp} [${label}] ${level}: ${message}`; 
});

// logger 생성
const logger = createLogger({
    format: combine(label({ label: "THE_FINALS_CNS" }), timestamp(), logFormat),
    transports: [
        new transports.Console(),
        new winstonDaily({
            level: "info", 
            datePattern: "YYYY-MM-DD", 
            dirname: logDir,
            filename: "%DATE%.log",
            maxSize: "20m",
            maxFiles: "30d",
        }),
        new winstonDaily({
            level: "error", 
            datePattern: "YYYY-MM-DD",
            dirname: logDir, 
            filename: "%DATE%.error.log",
            maxSize: "20m",
            maxFiles: "30d", 
        }),
    ],
});

module.exports = logger;