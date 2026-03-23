const {normalizeMessage} = require ('./src/whatsapp/normalize-message')

const namorada = normalizeMessage({
    message:{conversation: 'oi danado' }, 
    key: { remoteJid: '5519999999999' }
})
const erro = normalizeMessage({ 

})
console.log(namorada) // cod certo 
console.log(erro) // cod errado 
