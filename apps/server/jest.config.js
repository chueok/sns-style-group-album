/** @type {import('jest').Config} */

const config = {
  verbose: true,
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  setupFiles: ["dotenv/config"],
  maxWorkers: 1,
  moduleNameMapper: {
    "^@test/(.*)$": "<rootDir>/test/$1",
  },
};

module.exports = config;
