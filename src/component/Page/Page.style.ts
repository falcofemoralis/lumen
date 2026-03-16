import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  container: {
    height: '100%',
    width: '100%',
  },
  noConnectionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    marginTop: scale(16),
  },
} satisfies ThemedStyles);