function GetMessageText(message){ 
    if(message.message?.conversation){
        return message.message.conversation;
    }
    if(message.message?.extendedTextMessage?.text){
        return message.message.extendedTextMessage.text;
    }
    if(message.message?.imageMessage?.caption){
        return message.message.imageMessage.caption;
    }
    if(message.message?.videoMessage?.caption){
        return message.message.videoMessage.caption;
    }
}
    module.exports = {
        GetMessageText
};