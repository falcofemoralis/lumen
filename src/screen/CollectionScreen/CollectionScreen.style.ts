import { Theme, ThemedStyles } from 'Theme/types';

export const ROW_GAP = 6;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  item: {
    position: 'relative',
    marginBottom: scale(ROW_GAP),
  },
  rowItem: {
    marginRight: scale(ROW_GAP),
  },
  text: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    backgroundColor: colors.modal,
    width: '100%',
    padding: scale(4),
    zIndex: 10,
    fontSize: scale(text.xxs.fontSize),
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
    fontSize: scale(text.xxs.fontSize),
  },
  image: {
    width: '100%',
    aspectRatio: '208 / 120',
    borderRadius: scale(12),
  },
  empty: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
} satisfies ThemedStyles);
