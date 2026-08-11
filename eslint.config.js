// ********************************** ESLint **********************************
// Create React App used to lint as part of its build. That check was lost in the
// Vite migration, and this restores it as an explicit step.
//
// Flat config, which is the only format ESLint 9 reads.

import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['build/**', 'node_modules/**', 'src/assets/**']
  },

  js.configs.recommended,

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        // Vitest runs with globals: true, so describe/it/expect/vi are ambient.
        ...globals.vitest
      },
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    settings: {
      react: { version: 'detect' }
    },
    plugins: {
      react,
      'react-hooks': reactHooks
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // The project targets React 18 with the automatic JSX runtime, so React
      // does not need to be in scope for JSX.
      'react/react-in-jsx-scope': 'off',

      // Prop types are not used anywhere; the components are internal and small.
      'react/prop-types': 'off',

      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },

  {
    // Config files run in Node, not the browser.
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: globals.node
    }
  }
];
