import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useCallback } from 'react';
import { View } from 'react-native';
import { FilmInterface } from 'Type/Film.interface';

import { componentStyles } from './FilmViewFranchiseItem.style.atv';
import { FilmViewFranchiseItemComponentProps } from './FilmViewFranchiseItem.type';

export function FilmViewFranchiseItemComponent({
  item,
  idx,
  handleSelectFilm,
}: FilmViewFranchiseItemComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const {
    name,
    year,
    rating,
    link,
  } = item;
  const position = idx + 1;

  const onSelect = useCallback(() => {
    if (link) {
      handleSelectFilm({ link } as unknown as FilmInterface);
    }
  }, [link, handleSelectFilm]);

  return (
    <ThemedPressable
      onPress={ onSelect }
      style={ styles.franchiseItemPressable }
    >
      { ({ isFocused }) => (
        <View style={ [styles.franchiseItem, isFocused && styles.franchiseItemFocused] }>
          <ThemedText
            style={ [
              styles.franchiseText,
              !link && styles.franchiseSelected,
              isFocused && styles.franchiseTextFocused,
            ] }
          >
            { position }
          </ThemedText>
          <ThemedText
            style={ [
              styles.franchiseText,
              styles.franchiseName,
              !link && styles.franchiseSelected,
              isFocused && styles.franchiseTextFocused,
            ] }
          >
            { name }
          </ThemedText>
          <ThemedText
            style={ [
              styles.franchiseText,
              isFocused && styles.franchiseTextFocused,
            ] }
          >
            { year }
          </ThemedText>
          <ThemedText
            style={ [
              styles.franchiseText,
              isFocused && styles.franchiseTextFocused,
            ] }
          >
            { rating }
          </ThemedText>
        </View>
      ) }
    </ThemedPressable>
  );
}

export default memo(
  FilmViewFranchiseItemComponent,
  (prevProps, nextProps) => prevProps.idx === nextProps.idx
    && prevProps.item.link === nextProps.item.link
    && prevProps.item.name === nextProps.item.name
    && prevProps.item.year === nextProps.item.year
    && prevProps.item.rating === nextProps.item.rating
    && prevProps.handleSelectFilm === nextProps.handleSelectFilm
);
