import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light",
      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          "base-content": "#e5e7eb", // Lighter text for better readability
          "base-100": "#1a1b26", // Slightly lighter than pure black
          "base-200": "#24283b", // Cards and panels
          "base-300": "#414868", // Borders and dividers
          primary: "#c79656", // Gold/tan color matching your screenshot
          "primary-content": "#ffffff", // White text on primary
          secondary: "#9d7b5a",
          accent: "#7aa2f7",
          neutral: "#24283b",
          "neutral-content": "#e5e7eb",
        },
      },
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
    ],
  },
};