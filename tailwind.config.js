/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pop': 'pop 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'timer-shrink': 'timerShrink linear forwards',
        'pulse-glow': 'pulseGlow 1.5s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'shake': 'shake 0.4s ease',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pop: { from: { transform: 'scale(0.85)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        timerShrink: { from: { width: '100%' }, to: { width: '0%' } },
        pulseGlow: { '0%,100%': { opacity: 0.6 }, '50%': { opacity: 1 } },
        bounceIn: { from: { transform: 'scale(0.5)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '20%,60%': { transform: 'translateX(-6px)' }, '40%,80%': { transform: 'translateX(6px)' } },
      },
    },
  },
  plugins: [],
}
