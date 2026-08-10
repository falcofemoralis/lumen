import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo } from 'react';
import { View } from 'react-native';

import { componentStyles } from './FilmViewInfoList.style.atv';
import { FilmViewInfoListComponentProps } from './FilmViewInfoList.type';
import { formatInfoListPosition } from './FilmViewInfoList.utils';

export function FilmViewInfoListComponent({
  list,
  handleSelectCategory,
}: FilmViewInfoListComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const { name, position, link } = list;

  const positionLabel = formatInfoListPosition(position);

  const renderPosition = (isFocused: boolean) => {
    if (!positionLabel) {
      return null;
    }

    return (
      <ThemedText
        style={ [
          styles.infoListPosition,
          isFocused && styles.infoListTextFocused,
        ] }
      >
        { positionLabel }
      </ThemedText>
    );
  };

  return (
    <ThemedPressable
      onPress={ () => {
        handleSelectCategory(link);
      } }
      contentStyle={ styles.infoListContent }
    >
      { ({ isFocused }) => (
        <View
          style={ [
            styles.infoList,
            isFocused && styles.infoListFocused,
          ] }
        >
          <ThemedText
            style={ [
              styles.infoListName,
              isFocused && styles.infoListTextFocused,
            ] }
          >
            { name }
          </ThemedText>
          { renderPosition(isFocused) }
        </View>
      ) }
    </ThemedPressable>
  );
}

export default memo(
  FilmViewInfoListComponent,
  (prevProps, nextProps) => prevProps.list.link === nextProps.list.link
);
