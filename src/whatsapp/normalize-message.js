import { getMessageText } from './message-text.js';
import getMessageType from './message-type.js';

function normalizeMessage(message) {
  const normalized = {
    text: getMessageText(message),
    type: getMessageType(message),
    from: message.key?.remoteJid,
  };

  if (!normalized.type || !normalized.from) {
    return null;
  }

  return normalized;
}

export { normalizeMessage };