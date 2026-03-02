/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        vault: {
          900: '#020617',
          800: '#0f172a',
          700: '#1e293b',
          cyan: '#22d3ee',
          green: '#4ade80',
          amber: '#f59e0b',
          rose: '#fb7185',
        },
      },
      boxShadow: {
        glass: '0 10px 40px rgba(2, 6, 23, 0.45)',
      },
      animation: {
        pulseLock: 'pulse 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
