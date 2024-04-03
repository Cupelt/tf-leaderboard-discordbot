import winston from "winston";
import winstonDaily from "winston-daily-rotate-file"

const { combine, timestamp, label, printf } = winston.format;

const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`; 
});

const logger = winston.createLogger({
    format: combine(
        label({ label: "THE_FINALS_CNS" }),
        winston.format.colorize(),
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        logFormat
    ),
    transports: [
        new winston.transports.Console()
    ]
})

export default logger;