/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: "jsdom",
  roots: ["src"],
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
};
