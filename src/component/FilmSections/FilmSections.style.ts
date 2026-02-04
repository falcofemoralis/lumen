import { Theme, ThemedStyles } from 'Theme/types';

const ROW_GAP = 8;

export const componentStyles = ({ scale, text }: Theme) => ({
  gridRow: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(ROW_GAP),
    paddingBottom: scale(ROW_GAP),
  },
  headerText: {
    fontSize: scale(text.xl.fontSize),
    fontWeight: '700',
    paddingBottom: scale(4),
    marginBottom: scale(4),
  },
} satisfies ThemedStyles);
