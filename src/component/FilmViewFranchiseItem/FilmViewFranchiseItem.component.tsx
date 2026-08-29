import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useCallback } from 'react';
import { View } from 'react-native';
import { FilmInterface } from 'Type/Film.interface';

import { componentStyles } from './FilmViewFranchiseItem.style';
import { FilmViewFranchiseItemComponentProps } from './FilmViewFranchiseItem.type';

export function FilmViewFranchiseItemComponent({
  film,
  item,
  idx,
  handleSelectFilm,
}: FilmViewFranchiseItemComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const { franchise = [] } = film;
  const {
    name,
    year,
    rating,
    link,
  } = item;
  const position = Math.abs(idx - franchise.length);

  const onPress = useCallback(() => {
    if (link) {
      handleSelectFilm({ link } as unknown as FilmInterface);
    }
  }, [link, handleSelectFilm]);

  return (
    <ThemedPressable
      disabled={ !link }
      onPress={ onPress }
      style={ styles.franchiseItemButton }
      contentStyle={ styles.franchiseItemButtonContent }
    >
      <View style={ styles.franchiseItem }>
        <ThemedText style={ styles.franchiseText }>
          { position }
        </ThemedText>
        <ThemedText
          style={ [
            styles.franchiseText,
            styles.franchiseName,
            !link && styles.franchiseSelected,
          ] }
        >
          { name }
        </ThemedText>
        <ThemedText style={ styles.franchiseText }>
          { year }
        </ThemedText>
        <ThemedText style={ styles.franchiseText }>
          { rating }
        </ThemedText>
      </View>
    </ThemedPressable>
  );
}

export default memo(
  FilmViewFranchiseItemComponent,
  (prevProps, nextProps) => prevProps.item.link === nextProps.item.link
);
