/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    '@repo/eslint-config/react-internal.js',
    'plugin:storybook/recommended',
  ],
  ignorePatterns: ['postcss.config.mjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.lint.json',
    tsconfigRootDir: __dirname,
  },
};
