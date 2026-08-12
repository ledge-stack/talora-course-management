module.exports = {
  root: true,
  env: { node: true, browser: true, es2021: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2021, sourceType: 'module' },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {},
    },
  ],
};
