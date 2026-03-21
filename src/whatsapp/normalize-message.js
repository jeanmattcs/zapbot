const { GetMensagemText } = require('./menssagem-type');


function normalizeMessage(message){

    const text = GetMensagemText(message)
    const from = message.key.remoteJid

    return {
        text, from 
    }



}

module.exports = {
    normalizeMessage
};