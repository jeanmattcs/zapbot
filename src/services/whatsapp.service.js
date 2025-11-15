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
  }

  async connect() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(
        `./auth/${config.sessionName}`
      );

      const { version } = await fetchLatestBaileysVersion();

      // Logs silencioso (apenas erros fatais)
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

      console.log('Serviço WhatsApp iniciado!');
    } catch (error) {
      console.error('Erro ao conectar:', error);
      throw error;
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
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const errorMsg = lastDisconnect?.error?.message;

      console.log('Conexão fechada. Motivo:', statusCode, errorMsg);

      // erro 405: problema de sessão. Nesse caso, vai ser necessario escanear o QR Code novamente e apagar a sessão corrompida
      // caso raro 
      if (statusCode === 405) {
        console.log('Erro de conexão. Deletando sessão e tentando novamente...');

        // limpa a sessão corrompida
        const fs = require('fs');
        const path = require('path');
        const authPath = path.join(process.cwd(), 'auth', config.sessionName);

        if (fs.existsSync(authPath)) {
          fs.rmSync(authPath, { recursive: true, force: true });
          console.log('Sessão limpa. Reiniciando...');
        }

        if (this.retryCount < config.reconnect.maxRetries) {
          this.retryCount++;
          console.log(`Tentativa ${this.retryCount} de ${config.reconnect.maxRetries}...`);
          setTimeout(() => {
            this.connect();
          }, config.reconnect.retryDelay);
        } else {
          console.log('Número máximo de tentativas atingido.');
          process.exit(1);
        }
        return;
      }

      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect && this.retryCount < config.reconnect.maxRetries) {
        this.retryCount++;
        console.log(`Tentativa de reconexão ${this.retryCount} de ${config.reconnect.maxRetries}...`);
        setTimeout(() => {
          this.connect();
        }, config.reconnect.retryDelay);
      } else if (this.retryCount >= config.reconnect.maxRetries) {
        console.log('Número máximo de tentativas atingido.');
        process.exit(1);
      } else {
        console.log('Desconectado (logout)');
        process.exit(1);
      }
    }
    if (connection === 'open') {
      console.log('\n' + '='.repeat(50));
      console.log('CONECTADO COM SUCESSO!');
      console.log('='.repeat(50) + '\n');
      this.retryCount = 0;
    }
  }
  async handleMessages(m) {
    try {
      const message = m.messages[0];

      if (!message.key.fromMe && m.type === 'notify') {
        const from = message.key.remoteJid;
        const messageText = message.message?.conversation ||
                           message.message?.extendedTextMessage?.text ||
                           '';

        console.log(`\nNova mensagem de ${from}:`);
        console.log(`   ${messageText}\n`);
        // TODO: implementar
        // lógica para responder mensagens exemplo:
        // await this.sock.sendMessage(from, { text: 'Olá! Recebi sua mensagem.' });
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  }

  async sendMessage(to, text) {
    try {
      if (!this.sock) {
        throw new Error('WhatsApp não está conectado');
      }

      await this.sock.sendMessage(to, { text });
      console.log(`Mensagem enviada para ${to}`);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.sock) {
      await this.sock.logout();
      console.log('Desconectado do WhatsApp');
    }
  }
}

module.exports = WhatsAppService;