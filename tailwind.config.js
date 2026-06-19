/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f5fa',
          100: '#dce8f2',
          200: '#b8d1e6',
          300: '#8bb4d4',
          400: '#5d96c0',
          500: '#5B8FAE',
          600: '#4a7a97',
          700: '#3c647d',
          800: '#2f4f63',
          900: '#1f3342',
        },
        teal: {
          400: '#6FA89A',
          500: '#5d9990',
          600: '#4a8079',
        },
        sage: {
          400: '#8BB4A2',
          500: '#6fa28e',
          600: '#588d79',
        },
        surface: {
          base:   '#f4f7fa',
          card:   '#e8eef4',
          border: '#d4e0ec',
        },
        ink: {
          primary:     '#4A5568',
          secondary:   '#718096',
          placeholder: '#A0AEC0',
        },
        status: {
          success: '#68A89A',
          warning: '#D4956A',
          info:    '#A08AB4',
          danger:  '#C47A7A',
        },
        dark: {
          base:    '#1A2332',
          card:    '#243447',
          border:  '#2D4159',
          surface: '#1f2d3d',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Hiragino Kaku Gothic ProN',
          'Hiragino Sans',
          'Meiryo',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        card:    '0 1px 3px 0 rgba(91,143,174,0.08), 0 1px 2px -1px rgba(91,143,174,0.06)',
        panel:   '0 4px 6px -1px rgba(91,143,174,0.10), 0 2px 4px -2px rgba(91,143,174,0.08)',
        overlay: '0 20px 25px -5px rgba(30,50,80,0.12), 0 8px 10px -6px rgba(30,50,80,0.08)',
      },
    },
  },
  plugins: [],
};
