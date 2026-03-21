const { GetMessageText } = require('./message-text');
const { getMessageType } = require('./message-type');

function normalizeMessage(message){
    const text = GetMessageText(message)
    const type = getMessageType(message)
    const from = message.key.remoteJid
    return {
        text, type, from 
    }
}
module.exports = {
    normalizeMessage
};