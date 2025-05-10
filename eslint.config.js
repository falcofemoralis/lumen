const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const stylisticJsx = require('@stylistic/eslint-plugin-jsx');
const eslintComments = require('eslint-plugin-eslint-comments');
const etc = require('eslint-plugin-etc');
const reactPerf = require('eslint-plugin-react-perf');
const simpleImportSort = require('eslint-plugin-simple-import-sort');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    plugins: {
      '@stylistic/jsx': stylisticJsx,
      'eslint-comments': eslintComments,
      etc,
      'react-perf': reactPerf,
      'simple-import-sort': simpleImportSort
    },
    rules: {
      // eslint
      'no-multi-spaces': 'warn',
      'consistent-return': 'warn',
      'no-restricted-exports': 'off',
      'linebreak-style': 'off',
      'prefer-const': 'warn',
      'prefer-template': 'warn',
      'no-else-return': ['warn', {
        allowElseIf: false,
      }],
      indent: 'off',
      'default-param-last': 'off',
      'no-param-reassign': 0,
      'no-use-before-define': 'off',
      quotes: [2, 'single', {
        avoidEscape: true,
      }],
      'no-shadow': 'off',
      'newline-before-return': 'error',
      'class-methods-use-this': 'off',
      'function-paren-newline': ['error', 'consistent'],
      'prefer-regex-literals': 'off',
      'object-curly-spacing': ['error', 'always'],
      // @stylistic/eslint-plugin-jsx
      '@stylistic/jsx/jsx-max-props-per-line': 'warn',
      '@stylistic/jsx/jsx-closing-bracket-location': 'warn',
      '@stylistic/jsx/jsx-child-element-spacing': 'warn',
      '@stylistic/jsx/jsx-closing-tag-location': 'warn',
      '@stylistic/jsx/jsx-equals-spacing': 'warn',
      '@stylistic/jsx/jsx-newline': ['warn', {
        prevent: true,
      }],
      // eslint-plugin-eslint-comments
      'eslint-comments/require-description': ['off', {
        ignore: [],
      }],
      // eslint-plugin-etc
      'etc/no-commented-out-code': 'off',
      // eslint-plugin-react-perf
      'react-perf/jsx-no-new-object-as-prop': 'off',
      'react-perf/jsx-no-new-array-as-prop': 'off',
      'react-perf/jsx-no-new-function-as-prop': 'warn',
      'react-perf/jsx-no-jsx-as-prop': 'warn',
      // eslint-plugin-simple-import-sort"
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      // react
      'react/react-in-jsx-scope': 'off',
      'react-native/no-inline-styles': 0,
      'react-native/no-raw-text': 0,
      'react/prop-types': 'off',
      'react/no-unstable-nested-components': 'warn',
      'react/style-prop-object': 'off',
      'react/prefer-stateless-function': 'off',
      'react/no-unused-prop-types': 'off',
      'react/require-default-props': 'off',
      'react/default-props-match-prop-types': 'off',
      'react/static-property-placement': ['off'],
      'react/jsx-curly-spacing': ['error', {
        when: 'always',

        children: {
          when: 'always',
        },
      }],
      'react/jsx-key': 'error',
      'react/function-component-definition': ['error', {
        namedComponents: ['arrow-function', 'function-declaration', 'function-expression'],
        unnamedComponents: ['arrow-function', 'function-expression'],
      }],
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-indent-props': ['error', 2]
    },
  },
]);
