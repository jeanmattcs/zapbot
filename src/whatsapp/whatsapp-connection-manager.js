const {
  default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const ConnectionState = require('./connection-state');

class WhatsAppConnectionManager {
  constructor({ config, logger }) {
    this.config = config;
    this.logger = logger;
    this.sock = null;
    this.state = ConnectionState.IDLE;
    this.retryCount = 0;
    this.reconnectTimer = null;
    this.isConnecting = false;
  }

  async start() {
    await this.connect();
  }

  async stop() {
    this.transitionTo(ConnectionState.SHUTTING_DOWN);

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    await this.cleanupSocket('shutdown');
  }

  getState() {
    return this.state;
  }

  async connect() {
    if (this.isConnecting || this.state === ConnectionState.SHUTTING_DOWN) {
      return;
    }

    this.isConnecting = true;
    this.transitionTo(
      this.retryCount > 0 ? ConnectionState.RECONNECTING : ConnectionState.CONNECTING
    );

    try {
      await this.cleanupSocket('replace_socket');

      const { state, saveCreds } = await useMultiFileAuthState(
        `./auth/${this.config.whatsapp.sessionName}`
      );
      const { version } = await fetchLatestBaileysVersion();

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: this.config.whatsapp.browser,
        version,
        logger: this.logger.child({ module: 'baileys' }),
        syncFullHistory: false,
        markOnlineOnConnect: false,
      });

      this.sock.ev.on('connection.update', async (update) => {
        await this.handleConnectionUpdate(update);
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('messages.upsert', async (messageEvent) => {
        await this.handleMessages(messageEvent);
      });

      this.logger.info('Servico WhatsApp inicializado');
    } catch (error) {
      this.transitionTo(ConnectionState.FAILED, { error: error.message });
      this.logger.error({ err: error }, 'Erro ao conectar com o WhatsApp');
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  async handleConnectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      this.transitionTo(ConnectionState.QR_WAITING);
      this.printQrCode(qr);
    }

    if (connection === 'open') {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      this.retryCount = 0;
      this.transitionTo(ConnectionState.CONNECTED);
      this.logger.info('WhatsApp conectado com sucesso');
      return;
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const errorMessage = lastDisconnect?.error?.message;

      await this.cleanupSocket('connection_closed');

      if (this.state === ConnectionState.SHUTTING_DOWN) {
        return;
      }

      this.logger.warn(
        {
          statusCode,
          errorMessage,
          retryCount: this.retryCount,
        },
        'Conexao com WhatsApp encerrada'
      );

      if (statusCode === DisconnectReason.loggedOut) {
        this.transitionTo(ConnectionState.LOGGED_OUT, { statusCode });
        return;
      }

      if (statusCode === 405) {
        this.transitionTo(ConnectionState.LOGGED_OUT, { statusCode });
        this.logger.warn('Sessao invalida detectada. Remova auth/ e autentique novamente.');
        return;
      }

      if (this.retryCount >= this.config.whatsapp.reconnect.maxRetries) {
        this.transitionTo(ConnectionState.FAILED, { statusCode });
        return;
      }

      this.retryCount += 1;
      this.transitionTo(ConnectionState.RECONNECTING, {
        statusCode,
        retryCount: this.retryCount,
      });
      this.scheduleReconnect();
    }
  }

  async handleMessages(messageEvent) {
    try {
      const message = messageEvent.messages[0];

      if (!message?.key || message.key.fromMe || messageEvent.type !== 'notify') {
        return;
      }

      const from = message.key.remoteJid;
      const messageText =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        '';

      this.logger.info(
        {
          jid: from,
          messageId: message.key.id,
          text: messageText,
        },
        'Mensagem recebida'
      );
    } catch (error) {
      this.logger.error({ err: error }, 'Erro ao processar mensagem');
    }
  }

  async sendMessage(to, text) {
    if (!this.sock || this.state !== ConnectionState.CONNECTED) {
      throw new Error('WhatsApp nao esta conectado');
    }

    try {
      await this.sock.sendMessage(to, { text });
      this.logger.info({ jid: to }, 'Mensagem enviada');
    } catch (error) {
      this.logger.error({ err: error, jid: to }, 'Erro ao enviar mensagem');
      throw error;
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delayMs = this.calculateReconnectDelay();

    this.logger.info(
      {
        retryCount: this.retryCount,
        delayMs,
      },
      'Reconexao agendada'
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        this.logger.error({ err: error }, 'Tentativa de reconexao falhou');
      });
    }, delayMs);
  }

  calculateReconnectDelay() {
    const { baseDelayMs, maxDelayMs } = this.config.whatsapp.reconnect;
    const exponential = baseDelayMs * Math.pow(2, Math.max(this.retryCount - 1, 0));
    const jitter = Math.floor(Math.random() * 500);
    return Math.min(exponential + jitter, maxDelayMs);
  }

  async cleanupSocket(reason) {
    if (!this.sock) {
      return;
    }

    this.sock.ev.removeAllListeners('connection.update');
    this.sock.ev.removeAllListeners('creds.update');
    this.sock.ev.removeAllListeners('messages.upsert');

    if (typeof this.sock.end === 'function') {
      this.sock.end(new Error(reason));
    } else if (this.sock.ws && typeof this.sock.ws.close === 'function') {
      this.sock.ws.close();
    }

    this.sock = null;
  }

  printQrCode(qr) {
    this.logger.info('QR Code recebido. Aguardando autenticacao.');
    qrcode.generate(qr, { small: this.config.whatsapp.qrcode.small });
  }

  transitionTo(nextState, metadata = {}) {
    if (this.state === nextState) {
      return;
    }

    const previousState = this.state;
    this.state = nextState;

    this.logger.info(
      {
        event: 'connection.state_changed',
        previousState,
        state: nextState,
        ...metadata,
      },
      'Estado da conexao atualizado'
    );
  }
}

module.exports = WhatsAppConnectionManager;
