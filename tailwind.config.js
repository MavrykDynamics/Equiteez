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

          // brand green ----------------

          'brand-green': {
            50: '#C2EFE0',
            100: '#99E5CC',
            200: '#85E0C1',
            300: '#70DBB7',
            400: '#5CD5AD',
            500: '#33CB98',
            600: '#2EB789',
            700: '#29A27A',
            800: '#248E6A',
            900: '#1F7A5B',
            950: '#14513D',
          },

          // dark green ----------------

          'dark-green': {
            50: '#9AA3A0',
            100: '#677671',
            200: '#4E5F59',
            300: '#354841',
            400: '#1B312A',
            500: '#021A12',
            600: '#021710',
            700: '#02150E',
            800: '#01120D',
            900: '#01100B',
            950: '#010A07',
          },

          // green ----------------
          green: {
            50: '#9EE1C1',
            100: '#6ED1A3',
            200: '#56CA93',
            300: '#3DC284',
            400: '#25BB74',
            500: '#0DB365',
            600: '#0CA15B',
            700: '#0A8F51',
            800: '#097D47',
            900: '#086B3D',
            950: '#054828',
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
            50: '#A7D9FD',
            100: '#7CC5FB',
            200: '#66BCFB',
            300: '#50B2FA',
            400: '#3AA9FA',
            500: '#249FF9',
            600: '#208FE0',
            700: '#1D7FC7',
            800: '#196FAE',
            900: '#165F95',
            950: '#0E4064',
          },
        };

        // aliases
        const brandColors = {
          'green-main': baseColors['brand-green'][500],
          'green-secondary': '#28AD80',
          'green-tertiary': baseColors.green[500],

          'green-dark': '#1A654C',
          'green-opacity': 'rgba(51, 203, 152, 0.25)',
          'yellow-opacity': '#FDF1CA',
          'yellow-dark': '#654C1A',
          'blue-dark': '#1A4665',
          'blue-opacity': '#CCE0F2',
          content: baseColors['dark-green'][500],
          'content-secondary': '#354841',
          background: '#FFFFFF',
          'background-secondary': '#F4FBF8',
          'background-tertiary': '#FAFFFD',
          divider: '#E6E8E7',
          'divider-secondary': '#969696',

          tabs: '#CCF2E5',
          'active-tab': '#054731',
          'inactive-tab': '#F1F1F1',
          'info-blue-bg': '#F0F6FF',
          'cards-stroke': '#E6E6E6',
          links: '#194C98',
          error: '#DB1414',
          success: '#1E945C',
          'red-main': '#E83736',
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
};
