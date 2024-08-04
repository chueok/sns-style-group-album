module.exports = {
  root: true,
  extends: ['@repo/eslint-config/nest.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },

  ignorePatterns: ['.eslintrc.js', 'dist', 'node_modules'],
};
