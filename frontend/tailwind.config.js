/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        powder: {
          50: "#edf2fb",
          100: "#e2eafc",
          200: "#d7e3fc",
          300: "#ccdbfd",
          400: "#c1d3fe",
          500: "#b6ccfe",
          600: "#abc4ff"
        }
      },
      boxShadow: {
        card: "0 18px 45px -25px rgba(171,196,255,0.85)"
      }
    },
  },
  plugins: [],
};
