module.exports = {
  content: ["./src/**/*.tsx"],
  theme: {
    fontFamily: {
      icon: ["Material Icons"],
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
