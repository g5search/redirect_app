const winston = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');

const loggingWinston = new LoggingWinston();

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    loggingWinston
  ]
});

logger.info('***** Info initialized!');
logger.warn('***** Warn initialized!');
logger.error('***** Error initialized!');

module.exports = logger;
