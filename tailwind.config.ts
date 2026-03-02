import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0a0a0f',
          card: 'rgba(17, 17, 27, 0.6)',
        },
        primary: {
          DEFAULT: '#1db954',
          dark: '#168f3f',
        },
        accent: {
          blue: '#4f9eff',
          purple: '#a855f7',
          pink: '#ec4899',
        },
      },
      backdropBlur: {
        glass: '16px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
