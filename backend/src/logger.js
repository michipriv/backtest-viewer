/*
  Filename: backend/src/logger.js
  V 1.02
*/
import pino from 'pino';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logDir = join(__dirname, '../../logs');
const allLogFile = join(logDir, 'all.log');

const allLogStream = createWriteStream(allLogFile, { flags: 'a' });

/**
 * Custom Stream für pino der auch in all.log schreibt
 */
class DualStream {
  constructor(originalStream) {
    this.originalStream = originalStream;
  }
  
  write(chunk) {
    allLogStream.write(chunk);
    this.originalStream.write(chunk);
  }
}

/**
 * Erstellt und konfiguriert den zentralen Logger
 * @returns {pino.Logger} Konfigurierter Logger
 */
function createLogger() {
  const prettyStream = pino.transport({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  });

  return pino({
    level: 'info',
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      }
    },
    timestamp: pino.stdTimeFunctions.isoTime
  }, new DualStream(prettyStream));
}

export const logger = createLogger();

/**
 * Überschreibt console.log, console.error, console.warn
 */
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  allLogStream.write(`[CONSOLE.LOG] ${new Date().toISOString()} ${message}\n`);
  originalLog(...args);
};

console.error = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  allLogStream.write(`[CONSOLE.ERROR] ${new Date().toISOString()} ${message}\n`);
  originalError(...args);
};

console.warn = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  allLogStream.write(`[CONSOLE.WARN] ${new Date().toISOString()} ${message}\n`);
  originalWarn(...args);
};

/**
 * Fängt unbehandelte Exceptions
 */
process.on('uncaughtException', (error) => {
  allLogStream.write(`[UNCAUGHT_EXCEPTION] ${new Date().toISOString()} ${error.stack}\n`);
  logger.error({ error: error.message, stack: error.stack }, 'Unbehandelte Exception');
  process.exit(1);
});

/**
 * Fängt unbehandelte Promise Rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  allLogStream.write(`[UNHANDLED_REJECTION] ${new Date().toISOString()} ${reason}\n`);
  logger.error({ reason, promise }, 'Unbehandelte Promise Rejection');
});

// EOF
