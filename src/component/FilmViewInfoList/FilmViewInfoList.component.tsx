import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { memo } from 'react';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './FilmViewInfoList.style';
import { FilmViewInfoListComponentProps } from './FilmViewInfoList.type';
import { formatInfoListPosition } from './FilmViewInfoList.utils';

export function FilmViewInfoListComponent({
  list,
  handleSelectCategory,
}: FilmViewInfoListComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const { scale, theme } = useAppTheme();
  const { name, position, link } = list;

  const positionLabel = formatInfoListPosition(position);

  const renderPosition = () => {
    if (!positionLabel) {
      return null;
    }

    return (
      <View style={ styles.infoListPosition }>
        <ThemedText style={ styles.infoListPositionText }>
          { positionLabel }
        </ThemedText>
      </View>
    );
  };

  return (
    <ThemedPressable
      onPress={ () => handleSelectCategory(link) }
      style={ styles.infoListItem }
      contentStyle={ styles.infoListItemContent }
    >
      <ThemedText
        style={ styles.infoListName }
        numberOfLines={ 2 }
      >
        { name }
      </ThemedText>
      { renderPosition() }
      <ChevronRight
        size={ scale(18) }
        color={ theme.colors.textSecondary }
      />
    </ThemedPressable>
  );
}

export default memo(
  FilmViewInfoListComponent,
  (prevProps, nextProps) => prevProps.list.link === nextProps.list.link
);
