/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // WarehouseHub brand palette
        ink: 'var(--color-ink)',
        slate: 'var(--color-slate)',
        brass: 'var(--color-brass)',
        'brass-accessible': 'var(--color-brass-accessible)',
        chalk: 'var(--color-chalk)',
        linen: 'var(--color-linen)',
        fog: 'var(--color-fog)',
        'fog-accessible': 'var(--color-fog-accessible)',
        border: 'var(--color-border)',
        // Semantic
        success: '#3D7A5F',
        warning: '#C97B2E',
        error: '#B04040',
      },
      fontFamily: {
        serif: ['Apple Garamond', 'Garamond', 'EB Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl': ['44px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-lg': ['36px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-xl': ['28px', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'heading-lg': ['22px', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
        'heading-md': ['18px', { lineHeight: '1.4' }],
        'body-lg': ['17px', { lineHeight: '1.6' }],
        'body-md': ['15px', { lineHeight: '1.6' }],
        'body-sm': ['13px', { lineHeight: '1.5' }],
        'label-lg': ['14px', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'label-sm': ['12px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },
      spacing: {
        // 4px base unit
        '0.5': '2px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '18': '72px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
        '36': '144px',
        '40': '160px',
        '48': '192px',
        '56': '224px',
        '64': '256px',
      },
      maxWidth: {
        content: '1320px',
      },
      borderRadius: {
        card: '8px',
        btn: '6px',
        pill: '999px',
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(28,28,30,0.06)',
        'card-hover': '0 4px 20px rgba(28,28,30,0.10)',
        nav: '0 2px 12px rgba(28,28,30,0.08)',
        modal: '0 8px 40px rgba(28,28,30,0.16)',
        sm: '0 1px 4px rgba(28,28,30,0.06)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
        fast: '150ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      height: {
        navbar: '68px',
        'navbar-mobile': '60px',
      },
      gridTemplateColumns: {
        '12': 'repeat(12, minmax(0, 1fr))',
        '8': 'repeat(8, minmax(0, 1fr))',
        '4': 'repeat(4, minmax(0, 1fr))',
      },
      keyframes: {
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-in-left': 'slide-in-left 200ms ease',
        'fade-in': 'fade-in 200ms ease',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
