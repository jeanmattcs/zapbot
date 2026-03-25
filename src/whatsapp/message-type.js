export default function getMessageType(message) {
  const msg = message?.message;
  if (!msg) return null;

  if (msg.conversation || msg.extendedTextMessage) return "text";
  if (msg.imageMessage) return "image";
  if (msg.audioMessage) return "audio";
  if (msg.stickerMessage) return "sticker";

  return "unknown";
}