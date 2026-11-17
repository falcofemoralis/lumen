import { Theme, ThemedStyles } from 'Theme/types';

export const ROW_GAP = 16;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  grid: {
    marginTop: scale(24),
  },
  rowStyle: {
    gap: scale(ROW_GAP),
  },
  card: {
    width: '100%',
    aspectRatio: 208 / 120,
  },
  cardContent: {
    flex: 1,
    width: '100%',
  },
  item: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: scale(12),
    borderWidth: scale(2),
    borderColor: colors.transparent,
    overflow: 'hidden',
  },
  itemFocused: {
    borderWidth: scale(2),
    borderColor: colors.icon,
  },
  text: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    backgroundColor: colors.modal,
    width: '100%',
    padding: scale(4),
    zIndex: 10,
    fontSize: scale(text.xs.fontSize),
  },
  amount: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: colors.modal,
    padding: scale(4),
    zIndex: 10,
    justifyContent: 'flex-end',
    textAlign: 'right',
    fontSize: scale(text.xs.fontSize),
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: scale(12),
  },
  empty: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
} satisfies ThemedStyles);
