/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "selector", // Use 'dark' class on html element
  theme: {
    extend: {
      colors: {
        // Copper + Midnight Green Premium Theme
        carbon: {
          DEFAULT: '#0F1F1C',
          50: '#17302A',
          100: '#152824',
          200: '#0F1F1C',
          300: '#0D1A17',
          400: '#0B1513',
        },
        copper: {
          DEFAULT: '#C47A3A',
          50: '#E8D5C4',
          100: '#D4A574',
          200: '#C47A3A',
          300: '#B86F2F',
          400: '#A86428',
          500: '#985921',
        },
        neon: {
          copper: '#C47A3A',
          accent: '#6DB1A2',
          error: '#FF6B5B',
          text: '#E8F1EE',
          muted: '#9DBFB7',
        }
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",
        "fade-in-left": "fadeInLeft 0.6s ease-out",
        "fade-in-right": "fadeInRight 0.6s ease-out",
        "slide-in-up": "slideInUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-in-down": "slideInDown 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "scale-in": "scaleIn 0.5s ease-out",
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s infinite",
        float: "float 3s ease-in-out infinite",
        "bounce-light": "bounce-light 2s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        flip: "flip 6s linear infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
      },
      keyframes: {
        fadeInUp: {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeInDown: {
          from: {
            opacity: "0",
            transform: "translateY(-20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeInLeft: {
          from: {
            opacity: "0",
            transform: "translateX(-20px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        fadeInRight: {
          from: {
            opacity: "0",
            transform: "translateX(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        slideInUp: {
          from: {
            transform: "translateY(40px)",
            opacity: "0",
          },
          to: {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        slideInDown: {
          from: {
            transform: "translateY(-40px)",
            opacity: "0",
          },
          to: {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        scaleIn: {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "pulse-slow": {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.5",
          },
        },
        shimmer: {
          "0%": {
            "background-position": "-1000px 0",
          },
          "100%": {
            "background-position": "1000px 0",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "bounce-light": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-5px)",
          },
        },
        glow: {
          "0%, 100%": {
            "box-shadow": "0 0 5px rgba(147, 51, 234, 0.5)",
          },
          "50%": {
            "box-shadow": "0 0 20px rgba(147, 51, 234, 0.8)",
          },
        },
        flip: {
          "0%": {
            transform: "rotateY(0)",
          },
          "100%": {
            transform: "rotateY(360deg)",
          },
        },
        "gradient-shift": {
          "0%": {
            "background-position": "0% 50%",
          },
          "50%": {
            "background-position": "100% 50%",
          },
          "100%": {
            "background-position": "0% 50%",
          },
        },
      },
    },
  },
  plugins: [],
};
