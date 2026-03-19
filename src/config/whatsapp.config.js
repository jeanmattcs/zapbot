const appConfig = require('./app.config');

module.exports = {
  sessionName: appConfig.whatsapp.sessionName,
  qrcode: appConfig.whatsapp.qrcode,
  reconnect: {
    maxRetries: appConfig.whatsapp.reconnect.maxRetries,
    retryDelay: appConfig.whatsapp.reconnect.baseDelayMs,
  },
};
