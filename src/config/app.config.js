function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = {
  appName: 'zapbot',
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  whatsapp: {
    sessionName: process.env.SESSION_NAME || 'whatsapp-session',
    qrcode: {
      small: true,
    },
    browser: ['WhatsApp Bot', 'Chrome', '1.0.0'],
    reconnect: {
      maxRetries: toNumber(process.env.RECONNECT_MAX_RETRIES, 5),
      baseDelayMs: toNumber(process.env.RECONNECT_BASE_DELAY_MS, 3000),
      maxDelayMs: toNumber(process.env.RECONNECT_MAX_DELAY_MS, 30000),
    },
  },
};
