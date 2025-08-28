/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@shadcn/ui/dist/**/*.js"
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        DEFAULT: "100%",
        xl: "1200px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-sora)", "Sora", "sans-serif"],
      },
      colors: {
        neutral: require("tailwindcss/colors").zinc,
        slate: require("tailwindcss/colors").slate,
        accent: {
          DEFAULT: "#6366f1", // violet-500
          gradient: "linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)", // violet to blue
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 8px 0 rgba(0,0,0,0.04)",
        lift: "0 4px 24px 0 rgba(80,80,180,0.10)",
      },
      backgroundImage: {
        'radial-faint': 'radial-gradient(ellipse at 50% 0%, #e0e7ef 0%, #f8fafc 100%)',
        'grid': 'linear-gradient(0deg, transparent 24%, #e5e7eb 25%, #e5e7eb 26%, transparent 27%, transparent 74%, #e5e7eb 75%, #e5e7eb 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #e5e7eb 25%, #e5e7eb 26%, transparent 27%, transparent 74%, #e5e7eb 75%, #e5e7eb 76%, transparent 77%, transparent)'
      },
      outline: {
        accent: ['2px solid #6366f1', '2px'],
      },
      transitionProperty: {
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
