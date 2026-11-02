// The contact form opens the visitor's own email or WhatsApp with the message written out.
const WHATSAPP = '393200528300';
const EMAIL = 'info@cataniaairporttransfer.net';

const form = document.getElementById('contact-form');

function messageText() {
  const value = (name) => form.elements[name].value.trim();
  return `Topic: ${value('topic')}\nName: ${value('name')}\nEmail: ${value('email')}\n\n${value('message')}`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = encodeURIComponent(messageText());
  const subject = encodeURIComponent(form.elements.topic.value);
  location.href = event.submitter?.value === 'whatsapp'
    ? `https://wa.me/${WHATSAPP}?text=${text}`
    : `mailto:${EMAIL}?subject=${subject}&body=${text}`;
  document.getElementById('contact-sent').hidden = false;
});

const topic = new URLSearchParams(location.search).get('topic');
if ([...form.elements.topic.options].some((option) => option.value === topic)) form.elements.topic.value = topic;
