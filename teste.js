const { normalizeMessage } = require('./src/whatsapp/normalize-message');

const cachorro =  normalizeMessage({
  key: {remoteJid : '5519999999999@s.whatsapp.net' },
  message : { conversation: "suave bb"}

})
console.log(cachorro)