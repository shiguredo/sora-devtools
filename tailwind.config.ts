import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        misora: '#6C9BD2',
        'misora-dark': '#5A82B8',
      },
    },
  },
  plugins: [],
} satisfies Config
