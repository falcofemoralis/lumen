import { Theme, ThemedStyles } from 'Theme/types';

export const ROW_GAP = 18;

export const componentStyles = ({ scale }: Theme) => ({
  grid: {
    paddingTop: scale(13),
    paddingHorizontal: scale(6),
  },
  rowStyle: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(ROW_GAP),
  },
} satisfies ThemedStyles);