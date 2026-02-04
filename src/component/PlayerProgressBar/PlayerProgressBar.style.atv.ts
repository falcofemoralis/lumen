import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  progressBarContainer: {
    position: 'relative',
  },
  progressBar: {
    marginBlock: scale(12),
  },
  thumb: {
    width: scale(7),
    height: scale(7),
    borderRadius: scale(99),
    backgroundColor: colors.icon,
  },
  focusedThumb: {
    width: scale(12),
    height: scale(12),
  },
  storyBoard: {
    position: 'absolute',
    bottom: scale(40),
    alignSelf: 'center',
    backgroundColor: colors.background,
    opacity: 0,
  },
  storyBoardVisible: {
    opacity: 1,
  },
} satisfies ThemedStyles);
