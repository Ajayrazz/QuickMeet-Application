/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#f8fafc", // slate-50
          dark: "#0f172a", // slate-900
        },
        surface: {
          DEFAULT: "#ffffff",
          dark: "#1e293b", // slate-800
        },
        primary: {
          DEFAULT: "#4f46e5", // indigo-600
          dark: "#4338ca", // indigo-700
          light: "#818cf8" // indigo-400
        },
        card: {
          DEFAULT: "#ffffff",
          dark: "#1e293b",
        },
        text: {
          DEFAULT: "#0f172a", // slate-900
          dark: "#f8fafc", // slate-50
          muted: "#64748b", // slate-500
          "muted-dark": "#94a3b8" // slate-400
        },
        border: {
          DEFAULT: "#e2e8f0", // slate-200
          dark: "#334155" // slate-700
        },
        destructive: {
          DEFAULT: "#ef4444", // red-500
          dark: "#f87171" // red-400
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
