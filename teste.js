const { GetMensagemText } = require('./src/whatsapp/menssagem-type');
 
// texto simples
console.log(GetMensagemText({
  message: { conversation: 'oi' }
}));
// esperado: 'oi'
 
// sem texto
console.log(GetMensagemText({
  message: { audioMessage: {} }
}));
// esperado: null