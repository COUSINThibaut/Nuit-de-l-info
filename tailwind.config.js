/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          nird: {
            dark: '#1e293b', // Slate 800
            green: '#10b981', // Emerald 500
            blue: '#3b82f6', // Blue 500
            cream: '#fef3c7', // Amber 100
          }
        }
      },
    },
    plugins: [],
  }