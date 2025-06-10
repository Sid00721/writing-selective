import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Force light mode to ensure consistency across environments
  darkMode: 'class', // Use class-based dark mode instead of media queries
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  // Safelist commonly used classes to prevent purging in production
  safelist: [
    'bg-slate-50',
    'bg-white',
    'bg-gray-800',
    'bg-gray-700',
    'bg-gray-50',
    'text-gray-900',
    'text-gray-700',
    'text-gray-600',
    'text-white',
    'border-gray-300',
    'border-gray-800',
    'border-gray-200',
    'hover:bg-gray-700',
    'focus:ring-gray-800',
    'focus:ring-gray-500',
    'disabled:bg-gray-50',
    'disabled:cursor-not-allowed',
    'animate-spin',
    'animate-pulse',
  ],
  plugins: [],
};
export default config;
