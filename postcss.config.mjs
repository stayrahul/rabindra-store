/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}, // <-- CRITICAL IPAD FIX: Generates -webkit- prefixes
  },
};

export default config;