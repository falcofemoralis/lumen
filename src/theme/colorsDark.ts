const mainColors = {
  primary: '#004A77',
  secondary: '#E50000',
  tertiary: '#001E30',
  error: '#E50000',
};

const utilsColors = {
  transparent: 'transparent',
  modal: 'rgba(0, 0, 0, 0.6)',
  fade: 'rgba(0, 0, 0, 0.8)',
  pressableHighlight: 'rgba(191, 191, 191, 0.5)',
  pressableHighlightOpposite: '#383838',
};

const textColors = {
  text: '#E3E3E3',
  textFocused: '#303030',
  textSecondary: '#C4C7C5',
  textOnPrimary: '#0a1b38',
  textOnSecondary: '#E3E3E3',
  textOnTertiary: '#C2E7FF',
  textOnError: '#F9DEDC',
  textOnContrast: '#E3E3E3',
};

const backgroundColors = {
  background: '#000000',
  backgroundLight: '#252525',
  backgroundLighter: '#5B5B5B',
  backgroundFocused: '#E3E3E3',
  border: '#4E4E4E',
  darkBorder: '#383838',
  divider: '#4E4E4E',
  darkDivider: '#383838',
  thumbnail: '#252525',
  thumbnailHighlight: '#383838',
};

const buttonColors = {
  button: '#383838',
  buttonText: '#E3E3E3',
  buttonFocused: backgroundColors.backgroundFocused,
  chip: backgroundColors.backgroundLighter,
  chipText: '#E3E3E3',
  chipFocused: backgroundColors.backgroundFocused,
  icon: '#E3E3E3',
  iconFocused: '#000000',
  iconOnContrast: '#E3E3E3',
};

const inputColors = {
  input: '#383838',
  inputText: '#E3E3E3',
  inputFocused: backgroundColors.backgroundFocused,
};

export const colors = {
  ...mainColors,
  ...textColors,
  ...backgroundColors,
  ...utilsColors,
  ...buttonColors,
  ...inputColors,
} as const;
