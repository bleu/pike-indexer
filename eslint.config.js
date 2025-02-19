import globals from 'globals';
import js from '@eslint/js';
import * as parser from '@typescript-eslint/parser';
import ponderConfig from 'eslint-config-ponder';
import prettierConfig from 'eslint-config-prettier';

// Convert traditional config to flat config format
const flatPonderConfig = {
  rules: ponderConfig.rules || {},
  settings: ponderConfig.settings || {}
};

export default [
  {
    ignores: ['ponder-env.d.ts']
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    ...flatPonderConfig,
    ...prettierConfig
  }
];