/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0F172A',
        darkSurface: '#1E293B',
        darkSurfaceElevated: '#334155',
        sarthiPrimary: '#6366F1',
        sarthiPurple: '#8B5CF6',
        sarthiPink: '#EC4899',
        sarthiGold: '#FBBF24',
        sarthiAlert: '#F87171',
        sarthiText: '#F1F5F9',
        sarthiMuted: '#CBD5E1',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Noto Sans Devanagari', 'sans-serif'],
        headline: ['Poppins', 'Inter', 'Noto Sans Devanagari', 'sans-serif'],
        mono: ['Space Mono', 'JetBrains Mono', 'monospace'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'gradient-x': 'gradientX 8s ease infinite',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        glowPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.5))' },
          '50%': { filter: 'drop-shadow(0 0 28px rgba(236, 72, 153, 0.8))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        'primary-gradient': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'accent-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
      }
    },
  },
  plugins: [],
}
