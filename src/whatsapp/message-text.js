export function getMessageText(message) {
  const msg = message?.message;
  if (!msg) return null;

  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
  if (msg.imageMessage?.caption) return msg.imageMessage.caption;
  if (msg.videoMessage?.caption) return msg.videoMessage.caption;

  return null; // fallback importante
}
