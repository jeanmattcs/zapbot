const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const config = require('../config/whatsapp.config');

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.retryCount = 0;
    this.isShuttingDown = false;
    this.reconnectTimer = null;
    this.isConnecting = false;
  }

  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, config.reconnect.retryDelay);
  }

  async connect() {
    if (this.isShuttingDown || this.isConnecting) {
      return;
    }

    try {
      this.isConnecting = true;

      if (this.sock) {
        this.sock.ev.removeAllListeners('connection.update');
        this.sock.ev.removeAllListeners('creds.update');
        this.sock.ev.removeAllListeners('messages.upsert');

        if (typeof this.sock.end === 'function') {
          this.sock.end(new Error('replace_socket'));
        } else if (this.sock.ws && typeof this.sock.ws.close === 'function') {
          this.sock.ws.close();
        }

        this.sock = null;
      }

      const { state, saveCreds } = await useMultiFileAuthState(
        `./auth/${config.sessionName}`
      );

      const { version } = await fetchLatestBaileysVersion();

      // Silent logs (only fatal errors)
      const logger = pino({ level: 'silent' });

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ['WhatsApp Bot', 'Chrome', '1.0.0'],
        version,
        logger,
        syncFullHistory: false,
        markOnlineOnConnect: false,
      });

      this.sock.ev.on('connection.update', async (update) => {
        await this.handleConnectionUpdate(update);
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('messages.upsert', async (m) => {
        await this.handleMessages(m);
      });

      console.log('Servico WhatsApp iniciado!');
    } catch (error) {
      console.error('Erro ao conectar:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  async handleConnectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n' + '='.repeat(50));
      console.log('ESCANEIE O QR CODE COM SEU WHATSAPP');
      console.log('='.repeat(50) + '\n');
      qrcode.generate(qr, { small: config.qrcode.small });
      console.log('\n' + '='.repeat(50));
      console.log('Aguardando leitura do QR Code...');
      console.log('='.repeat(50) + '\n');
    }

    if (connection === 'close') {
      // Avoid auto reconnect when shutdown was intentional
      if (this.isShuttingDown) {
        return;
      }

      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const errorMsg = lastDisconnect?.error?.message;
      this.sock = null;

      console.log('Conexao fechada. Motivo:', statusCode, errorMsg);

      // 405 can happen due to invalid session files.
      if (statusCode === 405) {
        console.log('Erro de conexao. Deletando sessao e tentando novamente...');

        const fs = require('fs');
        const path = require('path');
        const authPath = path.join(process.cwd(), 'auth', config.sessionName);

        if (fs.existsSync(authPath)) {
          fs.rmSync(authPath, { recursive: true, force: true });
          console.log('Sessao limpa. Reiniciando...');
        }

        if (this.retryCount < config.reconnect.maxRetries) {
          this.retryCount++;
          console.log(`Tentativa ${this.retryCount} de ${config.reconnect.maxRetries}...`);
          this.scheduleReconnect();
        } else {
          console.log('Numero maximo de tentativas atingido.');
          process.exit(1);
        }
        return;
      }

      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect && this.retryCount < config.reconnect.maxRetries) {
        this.retryCount++;
        console.log(`Tentativa de reconexao ${this.retryCount} de ${config.reconnect.maxRetries}...`);
        this.scheduleReconnect();
      } else if (this.retryCount >= config.reconnect.maxRetries) {
        console.log('Numero maximo de tentativas atingido.');
        process.exit(1);
      } else {
        console.log('Desconectado (logout)');
        process.exit(1);
      }
    }

    if (connection === 'open') {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      console.log('\n' + '='.repeat(50));
      console.log('CONECTADO COM SUCESSO!');
      console.log('='.repeat(50) + '\n');
      this.retryCount = 0;
    }
  }

  async handleMessages(m) {
    try {
      const message = m.messages[0];
      if (!message?.key) {
        return;
      }

      if (!message.key.fromMe && m.type === 'notify') {
        const from = message.key.remoteJid;
        const messageText =
          message.message?.conversation ||
          message.message?.extendedTextMessage?.text ||
          '';

        console.log(`\nNova mensagem de ${from}:`);
        console.log(`   ${messageText}\n`);
        // TODO: implementar logica de resposta automatica.
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  }

  async sendMessage(to, text) {
    try {
      if (!this.sock) {
        throw new Error('WhatsApp nao esta conectado');
      }

      await this.sock.sendMessage(to, { text });
      console.log(`Mensagem enviada para ${to}`);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  async disconnect() {
    this.isShuttingDown = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.sock) {
      this.sock.ev.removeAllListeners('connection.update');
      this.sock.ev.removeAllListeners('creds.update');
      this.sock.ev.removeAllListeners('messages.upsert');

      // Do not logout on process shutdown, keep persisted session valid.
      if (typeof this.sock.end === 'function') {
        this.sock.end(new Error('shutdown'));
      } else if (this.sock.ws && typeof this.sock.ws.close === 'function') {
        this.sock.ws.close();
      }
      this.sock = null;
      console.log('Conexao encerrada');
    }
  }
}

module.exports = WhatsAppService;
