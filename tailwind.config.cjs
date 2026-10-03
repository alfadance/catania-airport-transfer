/** @type {import('tailwindcss').Config} */
module.exports = {
  future: { hoverOnlyWhenSupported: true },
  content: ['./index.html', './privacy.html', './wedding-transfers-taormina.html', './event-transportation-sicily.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
      },
      colors: {
        brandBlack: '#050608',
        brandNavy: '#1B3F5D',
        brandOrange: '#EE8211',
        brandOrangeHover: '#FF8F24',
        mist: '#F4F6F9',
      },
    },
  },
};

