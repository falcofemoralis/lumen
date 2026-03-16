const mainColors = {
  primary: '#4A9DD9',
  secondary: '#E50000',
  tertiary: '#b4dbff',
  error: '#E50000',
};

const utilsColors = {
  transparent: 'transparent',
  modal: 'rgba(0, 0, 0, 0.6)',
  fade: 'rgba(255, 255, 255, 0.8)',
  pressableHighlight: 'rgba(148, 148, 148, 0.5)',
  pressableHighlightOpposite: '#383838',
};

const textColors = {
  text: '#1C1C1C',
  textFocused: '#CCCCCC',
  textSecondary: '#3B3838',
  textOnPrimary: '#F5E4C7',
  textOnSecondary: '#E3E3E3',
  textOnTertiary: '#3D1800',
  textOnError: '#06211D',
  textOnContrast: '#E3E3E3',
};

const backgroundColors = {
  background: '#FFFFFF',
  backgroundLight: '#DADADA',
  backgroundLighter: '#bababa',
  backgroundFocused: '#1C1C1C',
  border: '#B1B1B1',
  darkBorder: '#C7C7C7',
  divider: '#B1B1B1',
  darkDivider: '#C7C7C7',
  thumbnail: '#DADADA',
  thumbnailHighlight: '#C7C7C7',
};

const buttonColors = {
  button: '#C7C7C7',
  buttonText: '#1C1C1C',
  buttonFocused: backgroundColors.backgroundFocused,
  chip: backgroundColors.backgroundLighter,
  chipText: '#1C1C1C',
  chipFocused: backgroundColors.backgroundFocused,
  icon: '#1C1C1C',
  iconFocused: '#FFFFFF',
  iconOnContrast: '#E3E3E3',
};

const inputColors = {
  input: '#C7C7C7',
  inputText: '#1C1C1C',
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
