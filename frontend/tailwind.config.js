/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        mist: "#f4f6fb",
        sea: "#0ea5a6",
        coral: "#f97316"
      }
    }
  },
  plugins: []
};
