// Central theme configuration for the MIS Dashboard
// This allows for easy global color and branding changes as requested.

export const theme = {
  colors: {
    primary: '#0f172a',    // Dark Navy
    secondary: '#64748b',  // Cool Gray
    accent: '#3b82f6',     // Bright Blue
    success: '#10b981',    // Emerald
    warning: '#f59e0b',    // Amber
    danger: '#ef4444',     // Red
    background: {
      light: '#f8fafc',
      dark: '#0f172a',
      card: '#ffffff'
    },
    border: '#e2e8f0'
  },
  fonts: {
    sans: '"Inter", system-ui, -apple-system, sans-serif',
    heading: '"Inter", system-ui, sans-serif'
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
  }
};

export default theme;
