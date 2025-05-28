const MainColors = {
  primary: '#004A77',
  secondary: '#E50000',
  tertiary: '#001E30',
  error: '#8C1D18',
};

const TextColors = {
  text: '#E3E3E3',
  textFocused: '#303030',
  textSecondary: '#C4C7C5',
  textOnPrimary: '#D3E3FD',
  textOnSecondary: '#E50000',
  textOnTertiary: '#C2E7FF',
  textOnError: '#F9DEDC',
};

const BackgroundColors = {
  background: '#0D0D0D',
  backgroundLight: '#252525',
  backgroundLighter: '#5B5B5B',
  backgroundFocused: '#E3E3E3',
  border: '#4E4E4E',
  darkBorder: '#262626',
  divider: '#4E4E4E',
  darkDivider: '#262626',
};

const ButtonColors = {
  button: '#383838',
  buttonText: '#E3E3E3',
  buttonFocused: BackgroundColors.backgroundFocused,
  chip: '#383838',
  chipText: '#E3E3E3',
  chipFocused: BackgroundColors.backgroundFocused,
};

const InputColors = {
  input: '#383838',
  inputText: '#E3E3E3',
  inputFocused: BackgroundColors.backgroundFocused,
};

const UtilsColors = {
  white: '#E3E3E3',
  black: '#000000',
  transparent: 'transparent',
  modal: 'rgba(0, 0, 0, 0.6)',
  whiteTransparent: 'rgba(191, 191, 191, 0.5)',
};

export const Colors = {
  ...MainColors,
  ...TextColors,
  ...BackgroundColors,
  ...UtilsColors,
  ...ButtonColors,
  ...InputColors,
};
