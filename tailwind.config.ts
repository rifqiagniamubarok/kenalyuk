import type { Config } from 'tailwindcss';
import { nextui } from '@nextui-org/react';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7FB77E',
          dark: '#5C9361',
          light: '#A8D5A2',
        },
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5F7F6',
        },
        text: {
          primary: '#1F2933',
          secondary: '#6B7280',
        },
      },
      borderRadius: {
        DEFAULT: '12px',
        md: '12px',
        lg: '16px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.06)',
        medium: '0 4px 16px rgba(0, 0, 0, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  darkMode: 'class',
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#7FB77E',
              foreground: '#FFFFFF',
            },
            focus: '#7FB77E',
          },
        },
      },
    }),
  ],
};

export default config;
