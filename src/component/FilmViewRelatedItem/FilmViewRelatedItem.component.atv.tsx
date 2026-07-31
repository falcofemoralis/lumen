import { FilmCard } from 'Component/FilmCard';
import { ThemedPressable } from 'Component/ThemedPressable';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useCallback } from 'react';
import { FilmInterface } from 'Type/Film.interface';

import { componentStyles } from './FilmViewRelatedItem.style.atv';
import { FilmViewRelatedItemComponentProps } from './FilmViewRelatedItem.type';

export function FilmViewRelatedItemComponent({
  item,
  handleSelectFilm,
}: FilmViewRelatedItemComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const { link } = item;

  const onSelect = useCallback(() => {
    if (link) {
      handleSelectFilm({ link } as unknown as FilmInterface);
    }
  }, [link, handleSelectFilm]);

  return (
    <ThemedPressable
      onPress={ onSelect }
    >
      { ({ isFocused }) => (
        <FilmCard
          filmCard={ item }
          isFocused={ isFocused }
          style={ styles.relatedListItem }
          disableScaleAnimation
        />
      ) }
    </ThemedPressable>
  );
}

export default memo(
  FilmViewRelatedItemComponent,
  (prevProps, nextProps) => prevProps.item.id === nextProps.item.id
);
