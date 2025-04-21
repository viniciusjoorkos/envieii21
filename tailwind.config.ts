import { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "matrix-green": "#00FF41",
        "neon-gold": "#FFD700",
        "dark-bg": "#111111",
        "card-bg": "#1A1A1A",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          background: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundColor: {
        background: "hsl(var(--background))",
      },
      textColor: {
        foreground: "hsl(var(--foreground))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "sidebar-slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "text-shimmer": {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 5px rgba(255, 215, 0, 0.3), 0 0 10px rgba(255, 215, 0, 0.2), 0 0 15px rgba(255, 215, 0, 0.1)"
          },
          "50%": {
            boxShadow: "0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3), 0 0 30px rgba(255, 215, 0, 0.2)"
          }
        },
        "content-fade": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        lightning: {
          "0%, 100%": { opacity: "0" },
          "5%, 10%": { opacity: "1" },
          "15%": { opacity: "0" },
          "20%, 25%": { opacity: "1" },
          "30%": { opacity: "0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.8" }
        },
        flow: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "energy-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 5px rgba(64, 156, 255, 0.3), 0 0 10px rgba(64, 156, 255, 0.2)",
            opacity: "0.8"
          },
          "50%": { 
            boxShadow: "0 0 15px rgba(64, 156, 255, 0.5), 0 0 30px rgba(64, 156, 255, 0.3)",
            opacity: "1"
          }
        },
        "electric-slide": {
          "0%": { 
            transform: "translateX(-100%)",
            opacity: "0" 
          },
          "20%": { opacity: "0.8" },
          "80%": { opacity: "0.8" },
          "100%": { 
            transform: "translateX(100%)",
            opacity: "0" 
          }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" }
        },
        "thunder-flash": {
          "0%, 100%": { 
            filter: "brightness(1)",
            textShadow: "0 0 5px rgba(64, 156, 255, 0.3), 0 0 10px rgba(64, 156, 255, 0.2)"
          },
          "0.5%": { 
            filter: "brightness(1.5)",
            textShadow: "0 0 10px rgba(64, 156, 255, 0.5), 0 0 20px rgba(64, 156, 255, 0.3)"
          },
          "1%": { 
            filter: "brightness(1)",
            textShadow: "0 0 5px rgba(64, 156, 255, 0.3), 0 0 10px rgba(64, 156, 255, 0.2)"
          },
          "2%": { 
            filter: "brightness(1.2)",
            textShadow: "0 0 7px rgba(64, 156, 255, 0.4), 0 0 14px rgba(64, 156, 255, 0.2)"
          },
          "3%": { 
            filter: "brightness(1)",
            textShadow: "0 0 5px rgba(64, 156, 255, 0.3), 0 0 10px rgba(64, 156, 255, 0.2)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "text-shimmer": "text-shimmer 3s infinite linear",
        "glow-pulse": "glow-pulse 3s infinite ease-in-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "content-fade": "content-fade 0.3s ease-out forwards",
        "lightning": "lightning 2s ease-in-out",
        "pulse-slow": "pulse-slow 3s infinite ease-in-out",
        "flow": "flow 10s infinite linear",
        "energy-pulse": "energy-pulse 3s infinite ease-in-out",
        "electric-slide": "electric-slide 3s ease-in-out",
        "float": "float 3s infinite ease-in-out",
        "thunder-flash": "thunder-flash 8s infinite linear"
      },
    },
  },
  plugins: [animatePlugin],
} satisfies Config;
