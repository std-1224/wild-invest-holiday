/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wild-dark-blue': '#0E181F',
        'wild-aqua': '#86DBDF',
        'wild-yellow': '#FFCF00',
        'wild-orange': '#EC874C',
        'wild-peach': '#FFCDA3',
        'wild-light-gray': '#F5F5F5',
      },
      fontFamily: {
        'eurostile': ['"Eurostile Condensed"', '"Arial Black"', 'Impact', 'sans-serif'],
        'helvetica': ['"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}