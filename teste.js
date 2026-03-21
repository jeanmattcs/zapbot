const {getMessageType} = require ('./src/whatsapp/messagetype')
console.log(getMessageType({ message: { conversation: 'oi' } })) // 'text'
console.log(getMessageType({ message: { imageMessage: {} } })) // 'image'
console.log(getMessageType({ message: { audioMessage: {} } })) // 'audio'
console.log(getMessageType({ message: {} })) // 'unknown'


