import * as winston from "winston";

const consoleOptions: winston.transports.ConsoleTransportOptions = {
  level: process.env.LOG_LEVEL || "info",
  handleExceptions: true,
};

const transports: winston.transport[] = [
  new winston.transports.Console(consoleOptions),
];

// Only add File transport if LOG_PATH is provided
if (process.env.LOG_PATH) {
  const fileOptions: winston.transports.FileTransportOptions = {
    level: process.env.LOG_LEVEL || "info",
    filename: process.env.LOG_PATH,
    handleExceptions: true,
    maxFiles: 100,
    maxsize: 5242880, // 5MB
  };
  transports.push(new winston.transports.File(fileOptions));
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  exitOnError: false,
  format: winston.format.json(),
  transports,
});

export default logger;
