/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#f8fafc",
          dark: "#0f172a",
        },
        primary: {
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
          light: "#818cf8"
        },
        card: {
          DEFAULT: "#ffffff",
          dark: "#1e293b",
        },
        text: {
          DEFAULT: "#0f172a",
          dark: "#f8fafc",
          muted: "#64748b",
          "muted-dark": "#94a3b8"
        },
        border: {
          DEFAULT: "#e2e8f0",
          dark: "#334155"
        },
        destructive: {
          DEFAULT: "#ef4444",
          dark: "#f87171"
        }
      }
    },
  },
  plugins: [],
}
