/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-maroon': '#532734',
        'burgundy': '#A0522D',
        'warm-pink': '#D2691E',
        'rose': '#F4A460',
        'light-cream': '#F5F5DC',
        'warm-beige': '#FFF8DC',
        'warm-white': '#FEFCF7',
        charcoal: '#2C2C2C',
        'warm-gray': '#6B6B6B',
        gold: '#B8860B',
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
        'accent': ['Lora', 'serif'],
      },
      letterSpacing: {
        'wide': '0.1em',
        'wider': '0.15em',
      },
    },
  },
  plugins: [],
};
