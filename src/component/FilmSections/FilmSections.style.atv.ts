import { Theme, ThemedStyles } from 'Theme/types';

export const ROW_GAP = 16;
const HEADER_HEIGHT = 32;

export const componentStyles = ({ scale }: Theme) => ({
  grid: {
    width: '100%',
    height: '100%',
  },
  header: {
    width: '100%',
    paddingTop: scale(ROW_GAP),
    // Cards are inset by half a gap each side, so match that to line the title
    // up with the first column.
    paddingHorizontal: scale(ROW_GAP) / 2,
  },
  headerText: {
    fontSize: scale(HEADER_HEIGHT),
    lineHeight: scale(HEADER_HEIGHT),
    fontWeight: '700',
  },
} satisfies ThemedStyles);
