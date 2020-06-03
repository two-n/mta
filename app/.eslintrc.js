module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    "import/extensions":[0, "never"] ,
    "import/no-unresolved": [0],
    "camelcase": [0, {"properties": "always"}],
    "no-unused-vars": [1],
    "@typescript-eslint/explicit-module-boundary-types": [0]
  },
};
