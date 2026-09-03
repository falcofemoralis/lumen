import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text }: Theme) => ({
  overlayContent: {
    width: '35%',
    flexDirection: 'row',
  },
  container: {
    width: '100%',
    flexDirection: 'column',
    gap: scale(12),
  },
  title: {
    fontSize: scale(text.lg.fontSize),
    fontWeight: '700',
  },
  automaticRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  automaticToggle: {
    flex: 1,
  },
  automaticToggleInput: {
    width: '100%',
    justifyContent: 'flex-end',
  },
} satisfies ThemedStyles);
