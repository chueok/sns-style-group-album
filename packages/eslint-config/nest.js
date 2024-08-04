const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'plugin:prettier/recommended',
    'eslint:recommended', 
    'plugin:@typescript-eslint/recommended',
    'turbo',
  ],
  env: {
    node: true,
    jest: true,
  },
  plugins: ['only-warn',],

  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },

  rules: {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"],
        "custom": {
          "regex": "^I[A-Z]",
          "match": true
        }
      }
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
