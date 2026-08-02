/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ifdark: "#0a0b1e",
        ifcard: "#14152e",
        ifborder: "#26284a",
        ifaccent: "#8b5cf6",
        ifcyan: "#22d3ee",
        ifgreen: "#4ade80",
        ifamber: "#fbbf24",
        ifred: "#f87171",
        ifpink: "#f472b6",
        iftext: "#e2e8f0",
        ifmuted: "#64748b",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
