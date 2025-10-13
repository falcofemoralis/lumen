const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const stylistic = require('@stylistic/eslint-plugin');
const eslintComments = require('eslint-plugin-eslint-comments');
const etc = require('eslint-plugin-etc');
const reactPerf = require('eslint-plugin-react-perf');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactCompiler = require('eslint-plugin-react-compiler');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/**', 'src/libs/**'],
    plugins: {
      '@stylistic-plugin': stylistic,
      'eslint-comments': eslintComments,
      etc,
      'react-perf': reactPerf,
      'simple-import-sort': simpleImportSort,
      '@typescript-eslint': typescriptEslint,
      'react-compiler': reactCompiler,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      // eslint
      'max-len': ['error', {
        code: 120,
        ignoreComments: true,
      }],
      'no-multi-spaces': 'warn',
      'consistent-return': 'warn',
      'no-restricted-exports': 'off',
      'linebreak-style': 'off',
      'prefer-const': 'warn',
      'prefer-template': 'warn',
      'no-else-return': ['warn', {
        allowElseIf: false,
      }],
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
      'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'func-call-spacing': ['error', 'never'],
      'comma-spacing': ['error', { before: false, after: true }],
      'no-trailing-spaces': ['error', {
        skipBlankLines: false,
        ignoreComments: false,
      }],
      'comma-dangle': ['error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      }],
      'semi': ['error', 'always'],
      // @typescript-eslint
      '@stylistic-plugin/indent': [2, 2],
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-use-before-define': 'off',
      // eslint-plugin-eslint-comments
      'eslint-comments/require-description': ['off', {
        ignore: [],
      }],
      // eslint-plugin-etc
      'etc/no-commented-out-code': 'off',
      // eslint-plugin-react-perf
      'react-perf/jsx-no-new-object-as-prop': 'off',
      'react-perf/jsx-no-new-array-as-prop': 'off',
      'react-perf/jsx-no-new-function-as-prop': 'off',
      'react-perf/jsx-no-jsx-as-prop': 'warn',
      // eslint-plugin-simple-import-sort"
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'import/no-named-as-default': 'off',
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
      // react airbnb
      'react/jsx-indent-props': ['error', 2],
      'react/jsx-indent': ['error', 2],
      'react/forbid-prop-types': ['error', {
        forbid: ['any', 'array', 'object'],
        checkContextTypes: true,
        checkChildContextTypes: true,
      }],
      'react/jsx-closing-bracket-location': ['error', 'line-aligned'],
      'react/jsx-closing-tag-location': 'error',
      'react/jsx-max-props-per-line': ['error', { maximum: 1, when: 'multiline' }],
      'react/jsx-no-undef': 'error',
      'react/jsx-pascal-case': ['error', {
        allowAllCaps: true,
        ignore: [],
      }],
      'react/jsx-uses-react': ['error'],
      'react/no-deprecated': ['error'],
      'react/no-did-update-set-state': 'error',
      'react/no-will-update-set-state': 'error',
      'react/no-is-mounted': 'error',
      'react/no-string-refs': 'error',
      'react/no-unknown-property': 'error',
      'react/prefer-es6-class': ['error', 'always'],
      'react/require-render-return': 'error',
      'react/self-closing-comp': 'error',
      'react/sort-comp': ['error', {
        order: [
          'static-variables',
          'static-methods',
          'instance-variables',
          'lifecycle',
          '/^handle.+$/',
          '/^on.+$/',
          'getters',
          'setters',
          '/^(get|set)(?!(InitialState$|DefaultProps$|ChildContext$)).+$/',
          'instance-methods',
          'everything-else',
          'rendering',
        ],
        groups: {
          lifecycle: [
            'displayName',
            'propTypes',
            'contextTypes',
            'childContextTypes',
            'mixins',
            'statics',
            'defaultProps',
            'constructor',
            'getDefaultProps',
            'getInitialState',
            'state',
            'getChildContext',
            'getDerivedStateFromProps',
            'componentWillMount',
            'UNSAFE_componentWillMount',
            'componentDidMount',
            'componentWillReceiveProps',
            'UNSAFE_componentWillReceiveProps',
            'shouldComponentUpdate',
            'componentWillUpdate',
            'UNSAFE_componentWillUpdate',
            'getSnapshotBeforeUpdate',
            'componentDidUpdate',
            'componentDidCatch',
            'componentWillUnmount',
          ],
          rendering: [
            '/^render.+$/',
            'render',
          ],
        },
      }],
      'react/jsx-wrap-multilines': ['error', {
        declaration: 'parens-new-line',
        assignment: 'parens-new-line',
        return: 'parens-new-line',
        arrow: 'parens-new-line',
        condition: 'parens-new-line',
        logical: 'parens-new-line',
        prop: 'parens-new-line',
      }],
      'react/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
      'react/jsx-equals-spacing': ['error', 'never'],
      'react/jsx-no-target-blank': ['error', { enforceDynamicLinks: 'always' }],
      'react/jsx-no-comment-textnodes': 'error',
      'react/no-render-return-value': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-unescaped-entities': 'error',
      'react/jsx-tag-spacing': ['error', {
        closingSlash: 'never',
        beforeSelfClosing: 'always',
        afterOpening: 'never',
        beforeClosing: 'never',
      }],
      'react/no-array-index-key': 'error',
      'react/no-typos': 'error',
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/jsx-one-expression-per-line': ['error', { allow: 'single-child' }],
      'react/destructuring-assignment': ['error', 'always'],
      'react/jsx-curly-newline': ['error', {
        multiline: 'consistent',
        singleline: 'consistent',
      }],
      'react/display-name': 'off',
      // eslint-plugin-react-compiler
      'react-compiler/react-compiler': 'error',
    },
  },
]);
