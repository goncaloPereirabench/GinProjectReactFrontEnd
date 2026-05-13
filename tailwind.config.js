/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#1b1e24",
          800: "#30343c",
          600: "#5d6572",
        },
        market: {
          700: "#176d55",
          600: "#1f8a68",
          100: "#dff5ec",
        },
        citrus: {
          500: "#e0a11b",
          100: "#fff3cf",
        },
      },
      boxShadow: {
        soft: "0 18px 50px -28px rgb(27 30 36 / 0.45)",
      },
    },
  },
  plugins: [],
};
