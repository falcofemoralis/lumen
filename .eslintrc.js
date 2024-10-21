// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: [
    'expo',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:prettier/recommended',
  ],
  plugins: ['prettier', 'react', 'react-native'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'react/jsx-first-prop-new-line': [2, 'multiline'],
    'react/jsx-max-props-per-line': [2, { maximum: 1 }],
    'react/react-in-jsx-scope': 'off',
    'react-native/no-inline-styles': 0,
    'react-native/no-raw-text': 0,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
