// // tailwind.config.ts
// import type { Config } from "tailwindcss";

// const config: Config = {
//   content: [
//     "./src/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };
// export default config;


// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // ✅ REQUIRED for manual toggle
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#ffffff',
          dark: '#0f172a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
