import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Monopoly board palette
        board: {
          DEFAULT: "#C7E3CE", // classic board play-area green
          deep: "#1E6B45", // dark frame / felt green
        },
        cream: "#FBF7E9", // parchment card / money paper
        monored: "#D4232A", // Monopoly red (logo, CHANCE)
        monoink: "#1A1A1A", // near-black board print
        // Property set colours (cheap → expensive), reused for wealth tiers.
        deed: {
          brown: "#955436",
          sky: "#66B6E0",
          pink: "#D4358F",
          orange: "#F7941D",
          red: "#ED1B24",
          yellow: "#F2D31C",
          green: "#1FA34A",
          blue: "#0070BA",
        },
        gold: {
          light: "#FFE9A8",
          DEFAULT: "#F5C518",
          dark: "#B8860B",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "Avenir Next",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        deed: "4px 4px 0 0 rgba(0,0,0,0.85)",
        "deed-sm": "2px 2px 0 0 rgba(0,0,0,0.85)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
