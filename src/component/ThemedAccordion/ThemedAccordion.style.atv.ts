import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  container: {
    width: '100%',
  },
  groupContainer: {
    width: '100%',
  },
  group: {
    width: '100%',
    padding: scale(12),
    borderRadius: scale(8),
    fontSize: scale(text.xs.fontSize),
  },
  groupFocused: {
    backgroundColor: colors.backgroundFocused,
    color: colors.textFocused,
  },
  content: {
    flexDirection: 'column',
  },
  overlay: {
    maxHeight: '70%',
    maxWidth: '50%',
  },
  itemsContainer: {
    width: '100%',
    height: 'auto',
  },
} satisfies ThemedStyles);
