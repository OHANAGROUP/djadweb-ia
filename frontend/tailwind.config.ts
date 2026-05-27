import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black:  '#0A0A0E',
          'black-hover': '#1A1A22',
          orange: '#E65100',
          bg:     '#F5F5F0',
          white:  '#FFFFFF',
        },
        judicial: {
          blue:   '#1565C0',
          dark:   '#0D47A1',
          light:  '#E3F2FD',
          border: '#90CAF9',
        },
        ui: {
          50:  '#F5F5F0',
          100: '#ECECEC',
          200: '#E0E0E0',
          300: '#CCCCCC',
          400: '#888888',
          500: '#666666',
          600: '#444444',
          700: '#2A2A2A',
          800: '#1A1A1A',
          900: '#0A0A0E',
        },
      },
      fontFamily: {
        brand: ['Barlow Condensed', 'Impact', 'Arial Narrow', 'sans-serif'],
        ui:    ['Syne', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        icon: '16px',
        card: '20px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,.06)',
        'card-hover': '0 24px 48px -15px rgba(10,10,14,.08)',
      },
    },
  },
  plugins: [],
}

export default config
