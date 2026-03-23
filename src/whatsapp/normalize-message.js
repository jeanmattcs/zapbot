const { GetMessageText } = require('./message-text');
const { getMessageType } = require('./message-type');

function normalizeMessage(message){
    const normalize = { text : GetMessageText(message)
     , type : getMessageType(message)
    , from : message.key?.remoteJid }

    if (!normalize.type || !normalize.from ){
        return null; 
    } 

    return normalize
}
module.exports = {
    normalizeMessage
};