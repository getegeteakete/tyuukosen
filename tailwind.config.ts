import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // マリンテーマ：ココナラ風シンプル + 海のニュアンス
        ocean: {
          50: '#f0f7fb',
          100: '#dbeaf3',
          200: '#bcd6e8',
          300: '#8fbad6',
          400: '#5d97bf',
          500: '#3f7ba8',
          600: '#30638d',
          700: '#285173',
          800: '#234560',
          900: '#0E3A5C',
          950: '#0a263d',
        },
        coral: {
          50: '#fff3f0',
          100: '#ffe1d8',
          200: '#ffc8b6',
          300: '#ffa384',
          400: '#ff7752',
          500: '#F25C54',
          600: '#e23a30',
          700: '#bd2a23',
          800: '#9c2521',
          900: '#812522',
        },
        sand: {
          50: '#FBFAF7',
          100: '#f5f1ea',
          200: '#e8dec9',
        },
      },
      fontFamily: {
        sans: ['Meiryo', 'メイリオ', 'Hiragino Sans', 'ヒラギノ角ゴシック', 'Yu Gothic', '游ゴシック', 'sans-serif'],
        display: ['Meiryo', 'メイリオ', 'Hiragino Sans', 'ヒラギノ角ゴシック', 'Yu Gothic', '游ゴシック', 'sans-serif'],
      },
      borderRadius: {
        'xl2': '14px',
      },
    },
  },
  plugins: [],
};

export default config;
