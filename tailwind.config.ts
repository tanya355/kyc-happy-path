import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Open Sans", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
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
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        /* AD Design System color palettes */
        "ds-neutral": {
          "000": "var(--color-neutral-000)",
          "100": "var(--color-neutral-100)",
          "200": "var(--color-neutral-200)",
          "300": "var(--color-neutral-300)",
          "400": "var(--color-neutral-400)",
          "500": "var(--color-neutral-500)",
          "600": "var(--color-neutral-600)",
          "700": "var(--color-neutral-700)",
          "800": "var(--color-neutral-800)",
          "900": "var(--color-neutral-900)",
        },
        "ds-blue": {
          "000": "var(--color-blue-000)",
          "100": "var(--color-blue-100)",
          "600": "var(--color-blue-600)",
          "700": "var(--color-blue-700)",
          "800": "var(--color-blue-800)",
          "900": "var(--color-blue-900)",
        },
        "ds-dark-blue": {
          "000": "var(--color-dark-blue-000)",
          "100": "var(--color-dark-blue-100)",
          "600": "var(--color-dark-blue-600)",
          "700": "var(--color-dark-blue-700)",
          "800": "var(--color-dark-blue-800)",
          "900": "var(--color-dark-blue-900)",
        },
        "ds-pacific-blue": {
          "000": "var(--color-pacific-blue-000)",
          "400": "var(--color-pacific-blue-400)",
          "600": "var(--color-pacific-blue-600)",
        },
        "ds-green": {
          "000": "var(--color-green-000)",
          "100": "var(--color-green-100)",
          "600": "var(--color-green-600)",
          "700": "var(--color-green-700)",
          "800": "var(--color-green-800)",
        },
        "ds-kpmg-green": {
          "500": "var(--color-kpmg-green-500)",
          "600": "var(--color-kpmg-green-600)",
          "700": "var(--color-kpmg-green-700)",
        },
        "ds-yellow": {
          "000": "var(--color-yellow-000)",
          "100": "var(--color-yellow-100)",
          "300": "var(--color-yellow-300)",
          "400": "var(--color-yellow-400)",
          "600": "var(--color-yellow-600)",
          "700": "var(--color-yellow-700)",
          "800": "var(--color-yellow-800)",
        },
        "ds-red": {
          "000": "var(--color-red-000)",
          "100": "var(--color-red-100)",
          "200": "var(--color-red-200)",
          "600": "var(--color-red-600)",
          "700": "var(--color-red-700)",
          "800": "var(--color-red-800)",
        },
        /* Legacy `kyc-*` aliases now resolve to ad-ds color tokens
           so the whole app uses the AD Design System palette. */
        kyc: {
          navy: "var(--color-dark-blue-600)",
          "navy-light": "var(--color-dark-blue-400)",
          blue: "var(--color-dark-blue-500)",
          "blue-light": "var(--color-dark-blue-000)",
          "blue-mid": "var(--color-dark-blue-200)",
          "neutral-50": "var(--color-neutral-000)",
          "neutral-100": "var(--color-neutral-100)",
          "neutral-200": "var(--color-neutral-200)",
          "neutral-300": "var(--color-neutral-300)",
          "neutral-400": "var(--color-neutral-400)",
          "neutral-500": "var(--color-neutral-500)",
          "neutral-600": "var(--color-neutral-600)",
          "neutral-700": "var(--color-neutral-700)",
          "neutral-800": "var(--color-neutral-800)",
          "neutral-900": "var(--color-neutral-900)",
          green: "var(--color-green-700)",
          red: "var(--color-red-700)",
        },
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
