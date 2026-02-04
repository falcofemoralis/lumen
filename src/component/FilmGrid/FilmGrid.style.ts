import { Theme, ThemedStyles } from 'Theme/types';

export const ROW_GAP = 8;

export const componentStyles = ({ scale }: Theme) => ({
  grid: {
    width: '100%',
    height: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(ROW_GAP),
    paddingBottom: scale(ROW_GAP),
  },
} satisfies ThemedStyles);
