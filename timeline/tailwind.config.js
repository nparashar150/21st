/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        timeline: {
          ruler: 'var(--color-timeline-ruler)',
          track: 'var(--color-timeline-track)',
          playhead: 'var(--color-timeline-playhead)',
          selection: 'var(--color-timeline-selection)',
          clip: 'var(--color-timeline-clip)',
          'clip-text': 'var(--color-timeline-clip-text)',
          'clip-border': 'var(--color-timeline-clip-border)',
        },
      },
    },
  },
  plugins: [],
}