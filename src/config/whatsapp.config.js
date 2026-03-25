import appConfig from './app.config.js';

export default {
  sessionName: appConfig.whatsapp.sessionName,
  qrcode: appConfig.whatsapp.qrcode,
  reconnect: {
    maxRetries: appConfig.whatsapp.reconnect.maxRetries,
    retryDelay: appConfig.whatsapp.reconnect.baseDelayMs,
  },
};
