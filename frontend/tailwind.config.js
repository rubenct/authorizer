/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e1a',
        surface: '#111827',
        border: '#1f2937',
        primary: '#3b82f6',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        'text-primary': '#f9fafb',
        'text-muted': '#6b7280',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
        sans: ['Geist', 'DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}