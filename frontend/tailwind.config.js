/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            colors: {
                brand: {
                    50: "#f0f9ff",
                    100: "#e0f2fe",
                    200: "#b9e6fe",
                    300: "#7cd4fd",
                    400: "#36bffa",
                    500: "#0ca5e9",
                    600: "#0284c7",
                    700: "#0369a1",
                    800: "#075985",
                    900: "#0c4a6e",
                    950: "#082f49",
                },
                bnb: {
                    yellow: "#F0B90B",
                    dark: "#1E2026",
                },
            },
            animation: {
                "pulse-slow": "pulse 3s ease-in-out infinite",
                "glow": "glow 2s ease-in-out infinite alternate",
            },
            keyframes: {
                glow: {
                    "0%": { boxShadow: "0 0 5px rgba(240,185,11,0.3)" },
                    "100%": { boxShadow: "0 0 20px rgba(240,185,11,0.6)" },
                },
            },
        },
    },
    plugins: [],
};
