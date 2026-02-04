import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  code: {
    color: colors.secondary,
    fontSize: scale(text.xl.fontSize),
    fontWeight: '700',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    gap: scale(20),
    justifyContent: 'center',
    padding: scale(20),
  },
  text: {
    fontSize: scale(text.sm.fontSize),
  },
} satisfies ThemedStyles);
