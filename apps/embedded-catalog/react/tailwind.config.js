/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {},
  },
  extend: {
    keyframes: {
      "shine": {
        from: { backgroundPosition: '200% 0' },
        to: { backgroundPosition: '-200% 0' },
      },
    },
    animation: {
      "shine": "shine 8s ease-in-out infinite",
    },
  },
  plugins: [],
}
 
