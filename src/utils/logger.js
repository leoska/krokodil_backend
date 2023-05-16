import winston from 'winston';
import moment from 'moment';

const logFormat = winston.format.printf(
  (info) => `${moment().format('YYYY-MM-DD HH:mm:ss:SSSS')} [${info.level}]: ${JSON.stringify(
    info.message,
    null,
    4,
  )}\n`,
);

const logger = winston.createLogger({
  level: 'silly',
  defaultMeta: { service: 'user-service' },
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/out.log',
    }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
  ],
});

export default logger;
