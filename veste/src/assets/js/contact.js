// The contact form opens the visitor's own email or WhatsApp with the message written out.
import { openMessage } from './messaging.js';

const form = document.getElementById('contact-form');

function messageText() {
  const value = (name) => form.elements[name].value.trim();
  return `Topic: ${value('topic')}\nName: ${value('name')}\nEmail: ${value('email')}\n\n${value('message')}`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  openMessage(event.submitter?.value, form.elements.topic.value, messageText());
  document.getElementById('contact-sent').hidden = false;
});

const topic = new URLSearchParams(location.search).get('topic');
if ([...form.elements.topic.options].some((option) => option.value === topic)) form.elements.topic.value = topic;
