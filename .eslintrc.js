module.exports = {
  env: {
    browser: false,
    node: true,
    commonjs: true,
    es6: true,
    jest: true
  },
  extends: 'eslint:recommended',
  parserOptions: { ecmaVersion: 2017 },
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 1,
    'no-console': 1,
    'no-trailing-spaces': 'error',
    'no-extra-parens': 'error'
  }
};
