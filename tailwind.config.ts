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
        washi: "#F5F0E8",
        koke: "#8B9E77",
        suna: "#C8B8A2",
        cha: "#6B5344",
        sumi: "#3A3028",
      },
      borderRadius: {
        btn: "9999px",
        card: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
