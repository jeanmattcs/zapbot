const appConfig = require('../config/app.config');
const createLogger = require('../observability/logger');
const WhatsAppConnectionManager = require('../whatsapp/whatsapp-connection-manager');

class AppBootstrap {
  constructor() {
    this.config = appConfig;
    this.logger = createLogger(this.config);
    this.whatsapp = new WhatsAppConnectionManager({
      config: this.config,
      logger: this.logger,
    });
    this.isShuttingDown = false;
  }

  async start() {
    this.registerProcessHandlers();

    this.logger.info(
      {
        app: this.config.appName,
        env: this.config.environment,
      },
      'Aplicacao iniciada'
    );

    await this.whatsapp.start();
  }

  async stop(signal = 'shutdown') {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    this.logger.info({ signal }, 'Encerrando aplicacao');
    await this.whatsapp.stop();
  }

  registerProcessHandlers() {
    const shutdown = async (signal) => {
      try {
        await this.stop(signal);
        process.exit(0);
      } catch (error) {
        this.logger.error({ err: error, signal }, 'Falha no encerramento');
        process.exit(1);
      }
    };

    process.once('SIGINT', () => {
      shutdown('SIGINT');
    });

    process.once('SIGTERM', () => {
      shutdown('SIGTERM');
    });
  }
}

module.exports = AppBootstrap;
