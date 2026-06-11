import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Command-center surface palette
        abyss: "#05070d",
        carbon: "#0a0e17",
        panel: "#0f1523",
        "panel-2": "#141b2d",
        edge: "#1e2840",
        muted: "#7d8aa8",
        // Brand / status
        neuron: {
          DEFAULT: "#1ee0c5",
          dim: "#0e6e62",
          glow: "#1ee0c5",
        },
        threat: {
          critical: "#ff2d55",
          high: "#ff7a18",
          medium: "#ffb020",
          low: "#3aa0ff",
          safe: "#1ee08a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(30,224,197,0.15), 0 0 30px -8px rgba(30,224,197,0.5)",
        "glow-red": "0 0 0 1px rgba(255,45,85,0.2), 0 0 30px -8px rgba(255,45,85,0.6)",
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -20px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(30,224,197,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(30,224,197,0.05) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(30,224,197,0.12) 0%, rgba(5,7,13,0) 70%)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.2,0.6,0.4,1) infinite",
        sweep: "sweep 6s linear infinite",
        "scan-line": "scan-line 3.5s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out both",
        ticker: "ticker 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
