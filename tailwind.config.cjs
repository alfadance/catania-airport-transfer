/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './privacy.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: {
        brandBlack: '#050608',
        brandNavy: '#1B3F5D',
        brandOrange: '#EE8211',
      },
    },
  },
};

