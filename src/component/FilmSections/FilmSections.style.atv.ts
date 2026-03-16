import { Theme, ThemedStyles } from 'Theme/types';

const ROW_GAP = 16;
const HEADER_HEIGHT = 32;

export const componentStyles = ({ scale }: Theme) => ({
  container: {
    width: '100%',
  },
  grid: {
    width: '100%',
  },
  rowStyle: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(ROW_GAP),
    paddingBlock: scale(ROW_GAP),
    paddingHorizontal: scale(ROW_GAP),
  },
  headerText: {
    fontSize: scale(HEADER_HEIGHT),
    lineHeight: scale(HEADER_HEIGHT),
    fontWeight: '700',
  },
} satisfies ThemedStyles);
