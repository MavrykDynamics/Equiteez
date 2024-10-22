import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  options: {
    whitelistPatterns: [/popper/, /tippy/],
    whitelistPatternsChildren: [/popper/, /tippy/],
  },
  separator: ':',
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
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
        'asset-input': [
          '2rem', // 32px
          {
            lineHeight: '2.25rem',
            fontWeight: '600',
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

        'caption-small': [
          '0.625rem', // 10px / 400
          {
            lineHeight: '0.938rem',
            fontWeight: '400',
          },
        ],
      },
      colors: (() => {
        const baseColors = {
          // neutrals ----------------
          white: '#FFFFFF',
          black: '#000',
          'black-secondary': '#010101',

          // gray ----------------

          gray: {
            50: '#F2F2F2',
            100: '#E6E6E6',
            200: '#CCCCCC',
            300: '#B3B3B3',
            400: '#999999',
            500: '#808080',
            600: '#666666',
            700: '#4C4C4C',
            800: '#333333',
            900: '#191919',
            950: '#0D0D0D',
          },

          // sand ----------------

          sand: {
            50: '#FCFAF5',
            100: '#E3E1DD',
            200: '#CAC8C4',
            300: '#B0AFAC',
            400: '#979693',
            500: '#7E7D7B',
            600: '#656462',
            700: '#4C4B49',
            800: '#323231',
            900: '#191918',
            950: '#010101',
          },

          // dark green ----------------

          'dark-green': {
            50: '#A4C0BA',
            100: '#77A197',
            200: '#609186',
            300: '#498175',
            400: '#337263',
            500: '#1C6252',
            600: '#19584A',
            700: '#164E42',
            800: '#144539',
            900: '#113B31',
            950: '#0B2721',
          },

          // green ----------------
          green: {
            50: '#A8D8B5',
            100: '#7CC591',
            200: '#66BB7E',
            300: '#51B16C',
            400: '#3BA859',
            500: '#459761',
            600: '#218E40',
            700: '#1E7E39',
            800: '#1A6F32',
            900: '#165F2B',
            950: '#0F3F1C',
          },

          // red -----------------

          red: {
            50: '#F6AFAF',
            100: '#F18786',
            200: '#EF7372',
            300: '#ED5F5E',
            400: '#EA4B4A',
            500: '#E83736',
            600: '#D13231',
            700: '#BA2C2B',
            800: '#A22726',
            900: '#8B2120',
            950: '#5D1616',
          },

          // yellow ------------------

          yellow: {
            50: '#FFE1B5',
            100: '#FFD38F',
            200: '#FFCB7D',
            300: '#FFC46A',
            400: '#FFBC58',
            500: '#FFB545',
            600: '#E6A33E',
            700: '#CC9137',
            800: '#B37F30',
            900: '#996D29',
            950: '#66481C',
          },

          // blue --------------------

          blue: {
            50: '#A8ABD8',
            100: '#7C81C5',
            200: '#666CBB',
            300: '#5157B1',
            400: '#3B42A8',
            500: '#252D9E',
            600: '#21298E',
            700: '#1E247E',
            800: '#1A1F6F',
            900: '#161B5F',
            950: '#0F123F',
          },
        };

        // aliases
        const brandColors = {
          'green-main': baseColors['dark-green'][500],
          'green-secondary': '#28AD80',
          'green-tertiary': baseColors.green[500],

          'green-dark': '#1A654C',
          'dark-green-opacity': '#1C625226',
          'dark-green-focus': '#1C625240',
          'yellow-opacity': '#FDF1CA',
          'yellow-dark': '#654C1A',
          'blue-dark': '#1A4665',
          'blue-opacity': '#BDBFDF',
          content: baseColors['sand'][900],
          'content-secondary': baseColors['sand'][700],
          background: baseColors.sand[50],
          'background-secondary': '#F4FBF8',
          'background-tertiary': '#FAFFFD',
          divider: '#E6E8E7',
          'divider-secondary': '#969696',

          tabs: baseColors.sand[700],
          'active-tab': '#054731',
          'inactive-tab': baseColors.sand[200],
          'info-blue-bg': '#A8ABD840',
          'cards-stroke': '#E6E6E6',
          links: '#194C98',
          error: baseColors.red[500],
          success: '#1E945C',
          'red-main': '#E83736',
          progress: '#50B2FA',
        };

        return {
          ...baseColors,
          ...brandColors,
        };
      })(),
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
        'card-secondary': '1px 2px 8px 0px rgba(0, 0, 0, 0.10);',
      },
      transitionProperty: {
        none: 'none',
        all: 'all',
        DEFAULT:
          'background-color, border-color, border, color, fill, stroke, opacity, box-shadow, transform, max-height, width',
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
} satisfies Config;
