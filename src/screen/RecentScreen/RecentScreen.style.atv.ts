import { Theme, ThemedStyles } from 'Theme/types';

const ROW_GAP = 24;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  page: {
    marginTop: 0,
  },
  grid: {
    padding: scale(ROW_GAP),
    marginLeft: scale(ROW_GAP),
    marginRight: scale(ROW_GAP),
  },
  rowStyle: {
    gap: scale(8),
  },
  item: {
    height: 'auto',
    flexDirection: 'row',
    gap: scale(8),
    opacity: 0.7,
    transform: [{ scale: 1 }],
    transitionProperty: 'all',
    transitionDuration: '250ms',
  },
  itemHidden: {
    opacity: 0.5,
  },
  itemFocused: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  posterContainer: {
    borderRadius: scale(8),
    borderWidth: scale(2),
    borderColor: colors.transparent,
    overflow: 'hidden',
  },
  posterContainerFocused: {
    borderWidth: scale(2),
    borderColor: colors.icon,
  },
  poster: {
    height: scale(150),
    width: 'auto',
    aspectRatio: '166 / 250',
  },
  itemContent: {
    height: '100%',
    justifyContent: 'center',
    gap: scale(8),
    padding: scale(16),
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: scale(text.sm.fontSize),
  },
  nameFocused: {
  },
  date: {
  },
  dateFocused: {
  },
  info: {
  },
  infoFocused: {
  },
  additionalInfo: {
  },
  additionalInfoFocused: {
  },
  actionButton: {
    backgroundColor: colors.transparent,
  },
  empty: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
} satisfies ThemedStyles);
