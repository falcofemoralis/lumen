import { TextStyle, ViewStyle } from 'react-native';
import { Theme } from 'Theme/types';

interface FilmListStyles {
  itemContentWrapper: ViewStyle;
  item: ViewStyle;
  itemBorder: ViewStyle;
  itemHidden: ViewStyle;
  itemContainer: ViewStyle;
  poster: ViewStyle;
  itemContent: ViewStyle;
  name: TextStyle;
  date: TextStyle;
  info: TextStyle;
  additionalInfo: TextStyle;
  actionsColumn: ViewStyle;
  actionButton: ViewStyle;
}

export const componentStyles = ({
  scale,
  colors,
  text,
}: Theme): FilmListStyles => ({
  itemContentWrapper: {
    width: '100%',
  },

  item: {
    width: '100%',
    paddingVertical: scale(10),
    paddingHorizontal: 10,
  },

  itemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  itemHidden: {
    opacity: 0.5,
  },

  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  poster: {
    width: scale(72),
    height: scale(108),
    borderRadius: scale(6),
  },

  itemContent: {
    flex: 1,
    marginLeft: scale(12),
    justifyContent: 'center',
  },

  name: {
    fontSize: scale(text.sm.fontSize),
    color: colors.text,
  },

  date: {
    marginTop: scale(4),
    fontSize: scale(text.xs.fontSize),
    color: colors.textSecondary,
  },

  info: {
    marginTop: scale(4),
    fontSize: scale(text.xs.fontSize),
    color: colors.textSecondary,
  },

  additionalInfo: {
    marginTop: scale(4),
    fontSize: scale(text.xs.fontSize),
    color: colors.textSecondary,
  },

  actionsColumn: {
    marginLeft: scale(8),
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionButton: {
    width: scale(40),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
