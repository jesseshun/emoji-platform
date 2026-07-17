/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Admin-specific surface tokens
        'admin-bg': '#F6F7F9',
        'admin-sidebar': '#1C1C1E',
        'admin-sidebar-hover': '#2C2C2E',
        'admin-sidebar-active': '#007AFF',
        'admin-border': 'rgba(0, 0, 0, 0.08)',
        'admin-border-strong': 'rgba(0, 0, 0, 0.14)',
      },
      borderRadius: {
        sm: '10px',
        DEFAULT: '12px',
        md: '14px',
        lg: '16px',
        xl: '20px',
        pill: '999px',
      },
      boxShadow: {
        'admin-card': '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'admin-elevated': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"',
          '"SF Pro Text"', '"PingFang SC"', '"Hiragino Sans GB"',
          '"Microsoft YaHei"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
