const pino = require('pino');

function createLogger(config) {
  return pino({
    level: config.logLevel,
    base: {
      app: config.appName,
      env: config.environment,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}

module.exports = createLogger;
