import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text, spacing }: Theme) => ({
  section: {
    marginTop: scale(16),
    width: '100%',
  },
  sectionHeading: {
    fontSize: scale(text.lg.fontSize),
    fontWeight: '700',
  },
  sectionHeadingWrapper: {
    paddingHorizontal: scale(spacing.wrapperPadding),
  },
  sectionContent: {
    marginTop: scale(8),
  },
} satisfies ThemedStyles);
