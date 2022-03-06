/** @type {import("@babel/core").TransformOptions} */
const BABEL_OPTIONS = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
    "@babel/preset-react",
    "@babel/preset-typescript",
  ],
};

/** @type {import('@jest/types').Config.InitialOptions} */
const JEST_OPTIONS = {
  testEnvironment: "jsdom",
  roots: ["src"],
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  transform: {
    "\\.tsx?$": ["babel-jest", BABEL_OPTIONS],
  },
};

module.exports = JEST_OPTIONS;
