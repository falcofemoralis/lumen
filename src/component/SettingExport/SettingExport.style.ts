import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  overlay: {
    width: '100%',
    maxHeight: '100%',
  },
  container: {
    padding: scale(8),
    flexDirection: 'column',
    gap: scale(12),
  },
  note: {
    fontSize: scale(text.sm.fontSize),
    opacity: 0.7,
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: scale(8),
    justifyContent: 'flex-end',
  },
  button: {
    flex: 1,
  },
  buttonContent: {
    paddingInline: scale(20),
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
} satisfies ThemedStyles);
