module.exports = {
  extends: ["prettier"],
  parser: "@typescript-eslint/parser",
  /** @type {import("@typescript-eslint/types").ParserOptions} */
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
  },
  plugins: ["eslint-plugin-import", "@typescript-eslint"],
  rules: {
    "import/order": ["error"],
    "sort-imports": ["error", { ignoreDeclarationSort: true }],
  },
};
