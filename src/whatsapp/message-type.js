function getMessageType (message){
    const msg = message.message;
    if (msg.conversation){
        return "text";
    }
    if (msg.extendedTextMessage){
        return "text";
    }
    if (msg.imageMessage){
        return "image";
    }
    if (msg.audioMessage){
        return "audio";
    }
    if (msg.stikerMessage){
        return "stiker";
    }
    if (!msg){
        return "unknown";
    }
} 
module.exports = {
    getMessageType
};