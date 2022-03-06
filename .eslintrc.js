module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ["prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
  },
  plugins: ["eslint-plugin-import", "@typescript-eslint"],
  rules: {
    "import/order": ["error"],
    "sort-imports": ["error", { ignoreDeclarationSort: true }],
  },
  ignorePatterns: [],
};
