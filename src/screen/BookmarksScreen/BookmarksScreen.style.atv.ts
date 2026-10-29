import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  empty: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  content: {
    height: '100%',
    width: '100%',
  },

  emptyCategory: {
    alignItems: 'center',
  },
  manageButton: {
    width: scale(44),
    height: scale(44),
    backgroundColor: colors.transparent,
    borderRadius: scale(12),
  },
  manageButtonContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: '100%',
    height: '100%',
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(12),
    backgroundColor: colors.transparent,
  },
  manageButtonFocused: {
    backgroundColor: colors.transparent,
  },
  manageButtonText: {
    display: 'none',
  },
} satisfies ThemedStyles);
