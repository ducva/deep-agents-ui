/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#d0ccec',
        'user-message': '#076699',
        'avatar-bg': '#ebe8fe',
        secondary: '#1c3c3c',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        background: '#f9f9f9',
        'subagent-hover': '#d0c9fe',
        surface: '#f9fafb',
        border: '#e5e7eb',
        'border-light': '#f3f4f6',
        'text-primary': '#111827',
        'text-secondary': '#6b7280',
        'text-tertiary': '#9ca3af',
      },
      fontFamily: {
        mono: [
          'SF Mono',
          'Monaco',
          'Cascadia Code',
          'Roboto Mono',
          'Consolas',
          'Courier New',
          'monospace'
        ],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      fontWeight: {
        'medium': '500',
        'semibold': '600',
      },
      lineHeight: {
        'tight': '1.25',
        'normal': '1.5',
        'relaxed': '1.75',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'lg': '0 10px 15px -3px var(--color-border), 0 4px 6px -2px var(--color-border-light)',
        'xl': '0 20px 25px -5px var(--color-border), 0 10px 10px -5px var(--color-border-light)',
      },
      transitionDuration: {
        'base': '200ms',
      },
      spacing: {
        'sidebar': '320px',
        'sidebar-collapsed': '60px',
        'header-height': '64px',
        'panel': '40vw',
        'chat-max': '900px',
      },
      maxWidth: {
        'chat': '900px',
      },
      width: {
        'sidebar': '320px',
        'sidebar-collapsed': '60px',
        'panel': '40vw',
      },
      height: {
        'header': '64px',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};