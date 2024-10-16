export const Colors = {
  primary: '#E50000',
  secondary: '#004A77',
  background: '#000000', //main bg
  lightBackground: '#1A1A1A', //cards bg
  gray: '#444746', // genres, country badges
  lightGray: '#C4C7C5', // secondary text
  white: '#E3E3E3', // default text
};

export const ThemeColors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
    link: '#0a7ea4',
  },
  dark: {
    text: Colors.white,
    background: Colors.background,
    tint: Colors.primary,
    icon: Colors.gray,
    tabIconDefault: Colors.lightGray,
    tabIconSelected: Colors.primary,
    link: Colors.primary,
  },
};

export default Colors;
