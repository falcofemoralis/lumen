import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text, colors }: Theme) => ({
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: scale(16),
    borderColor: colors.darkBorder,
    borderWidth: 1,
  },
  section: {
    marginTop: scale(16),
    padding: scale(16),
  },
  sectionHeading: {
    fontSize: scale(text.lg.fontSize),
    fontWeight: '700',
  },
  sectionContent: {
    marginTop: scale(8),
    flexDirection: 'column',
  },
} satisfies ThemedStyles);
