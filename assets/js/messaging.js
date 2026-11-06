// Opens the visitor's own WhatsApp or email app with the message written out, ready to send.
import { currentSource, withRef } from './whatsapp-context.js';

const WHATSAPP = '393200528300';
const EMAIL = 'info@cataniaairporttransfer.net';

export function openMessage(channel, subject, text) {
  const body = encodeURIComponent(withRef(text, currentSource()));
  location.href = channel === 'whatsapp'
    ? `https://wa.me/${WHATSAPP}?text=${body}`
    : `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
}
