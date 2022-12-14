module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'at-rule-no-unknown': null,
    'css/at-rule-no-unknown': [
      true,
      {
          'ignoreAtRules': ['tailwind']
      }
  ],
  },
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
  },
};
