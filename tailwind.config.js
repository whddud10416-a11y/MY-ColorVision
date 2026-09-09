/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./app.js", "./js/**/*.js"],
  safelist: ['text-red-400', 'text-emerald-400', 'text-blue-400', 'bg-red-600', 'bg-emerald-600', 'bg-blue-600'],
  theme: {
    extend: {},
  },
  plugins: [],
}
