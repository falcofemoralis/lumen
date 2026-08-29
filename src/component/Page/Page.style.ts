import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  container: {
    height: '100%',
    width: '100%',
  },
  noConnectionContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: scale(16),
  },
} satisfies ThemedStyles);