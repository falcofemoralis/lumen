import BookmarkCheck from 'lucide-react-native/icons/bookmark-check';
import { View } from 'react-native';
import { t } from 'i18n/translate';
import { useAppTheme } from 'Theme/context';

export const BookmarkBadge = ({ visible }: { visible?: boolean }) => {
  const { theme, scale } = useAppTheme();
  if (!visible) return null;
  return (
    <View pointerEvents='none' accessibilityLabel={ t('Bookmarks') } style={ {
      position: 'absolute', top: scale(38), left: scale(4), zIndex: 21,
      backgroundColor: theme.colors.button, borderRadius: scale(4), padding: scale(4),
    } }>
      <BookmarkCheck size={ scale(18) } color={ theme.colors.textOnContrast } />
    </View>
  );
};
