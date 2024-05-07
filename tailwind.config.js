export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  separator: ':',
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif', 'system-ui'],
      },
      fontSize: {
        hero: [
          '3.25rem', // 52px
          {
            lineHeight: '3.75rem',
            fontWeight: '700',
          },
        ],
        'section-headline': [
          '2.25rem', // 36px
          {
            lineHeight: '2.75rem',
            fontWeight: '700',
          },
        ],
        'slider-headline': [
          '1.5rem',
          {
            fontWeight: 600,
            lineHeight: '2rem',
          },
        ],
        'card-headline': [
          '1.25rem', // 20px
          {
            lineHeight: '1.75rem',
            fontWeight: '600',
          },
        ],
        buttons: [
          '1rem', // 16px / 600
          {
            lineHeight: '1.5rem',
            fontWeight: '600',
          },
        ],
        body: [
          '1rem', // 16px / 400
          {
            lineHeight: '1.5rem',
            fontWeight: '400',
          },
        ],
        'body-xs': [
          '0.875rem', // 14px
          {
            lineHeight: '1.25rem',
            fontWeight: '400',
          },
        ],
        caption: [
          '0.75rem', // 12px / 600
          {
            lineHeight: '1.125rem',
            fontWeight: '600',
          },
        ],
        'caption-regular': [
          '0.75rem', // 12px / 400
          {
            lineHeight: '1.125rem',
            fontWeight: '400',
          },
        ],
      },
      colors: {
        white: '#FFFFFF',
        'green-main': '#33CB98',
        'green-secondary': '#28AD80',
        content: '#021A12',
        'content-secondary': '#354841',
        background: '#FFFFFF',
        'background-secondary': '#F4FBF8',
        divider: '#E6E8E7',
        tabs: '#CCF2E5',
        'active-tab': '#054731',
        'inactive-tab': '#F1F1F1',
        'info-blue-bg': '#F0F6FF',
        'cards-stroke': '#E6E6E6',
        links: '#194C98',
        error: '#DB1414',
        success: '#1E945C',
      },
      spacing: {
        container: '1440px',
      },
      gridTemplateColumns: {
        footer: '420px 1fr',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0.5px 0.5px 0px 0px rgba(0, 0, 0, 0.03), 1px 2px 15px 0px rgba(0, 0, 0, 0.05);',
      },
      transitionProperty: {
        none: 'none',
        all: 'all',
        DEFAULT:
          'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
        colors: 'background-color, border-color, color, fill, stroke',
        opacity: 'opacity',
        shadow: 'box-shadow',
        transform: 'transform',
        height: 'height',
      },
      transitionTimingFunction: {
        linear: 'linear',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms',
      },
      transitionDelay: {
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms',
      },
      keyframes: {
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        spin: 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
};
