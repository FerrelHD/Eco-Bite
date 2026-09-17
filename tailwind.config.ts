import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#2D6A4F",
        "brand-secondary": "#52B788",
        "brand-light": "#EBFDF3",
        "brand-dark": "#1B4332",
        "status-warning": "#F77F00",
        "status-success": "#2E7D32",
        "surface-canvas": "#F8FAF9",
        "surface-card": "#FFFFFF",
        "text-primary": "#1E293B",
        "text-muted": "#64748B",
        "border-subtle": "#E2E8F0",
      },
      boxShadow: {
        "subtle": "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
        "card": "0 4px 20px -2px rgba(45, 106, 79, 0.06), 0 2px 6px -1px rgba(0,0,0,0.03)",
        "card-hover": "0 10px 25px -4px rgba(45, 106, 79, 0.12), 0 4px 10px -2px rgba(0,0,0,0.04)",
      },
      borderRadius: {
        "sm": "8px",
        "md": "12px",
        "lg": "18px",
        "xl": "24px",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "SF Pro", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
