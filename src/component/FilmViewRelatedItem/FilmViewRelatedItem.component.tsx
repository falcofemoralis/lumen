import { FilmCard } from 'Component/FilmCard';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useCallback } from 'react';
import { Pressable } from 'react-native';
import { FilmInterface } from 'Type/Film.interface';

import { componentStyles } from './FilmViewRelatedItem.style';
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
    <Pressable
      style={ styles.relatedItem }
      onPress={ onSelect }
    >
      <FilmCard
        filmCard={ item }
      />
    </Pressable>
  );
}

export default memo(
  FilmViewRelatedItemComponent,
  (prevProps, nextProps) => prevProps.item.id === nextProps.item.id
);
