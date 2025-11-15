module.exports = {
  // nome da sessão (usado para salvar os dados de autenticação)
  sessionName: 'whatsapp-session',
  // configuracoes de exibicao do qrcode
  qrcode: {
    small: true,
  },
  
  // configurações de reconexão
  reconnect: {
    maxRetries: 5,
    retryDelay: 3000, // 3 sec
  },
};

