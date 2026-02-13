import winston from 'winston';
import path from 'path';
import { CONSTANTS } from '@dam/constants/constants';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  }),
);

export const logger = winston.createLogger({
  level: CONSTANTS.LOG.LOG_LEVEL.INFO || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new winston.transports.File({
      filename: path.join(
        '../../',
        CONSTANTS.LOG.LOG_FOLDER_NAME,
        CONSTANTS.LOG.ERROR_LOG_FILE_NAME,
      ),
      level: CONSTANTS.LOG.LOG_LEVEL.ERROR,
    }),
    new winston.transports.File({
      filename: path.join(
        '../../',
        CONSTANTS.LOG.LOG_FOLDER_NAME,
        CONSTANTS.LOG.COMBINED_LOG_FILE_NAME,
      ),
    }),
  ],
});

import fs from 'fs';
const logsDir = path.join('../../', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
