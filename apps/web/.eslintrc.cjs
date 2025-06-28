const config = require('@repo/eslint-config/next.js');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [config],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
};
