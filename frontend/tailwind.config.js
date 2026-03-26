/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: "var(--bg-main)",
        card: "var(--bg-card)",
        primary: "var(--primary)",
        primaryHover: "var(--primary-hover)",
        primaryLight: "var(--primary-light)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        borderColor: "var(--border)",
        inputBg: "var(--input-bg)",
        btnText: "var(--btn-text)",
      },
      boxShadow: {
        custom: "var(--shadow)",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      animation: {
        'float-slow': 'float 4s ease-in-out infinite',
      },
      screens: {
        xs: "425px",
        mb: "512px",
      },
    },
  },
  plugins: [],
}

