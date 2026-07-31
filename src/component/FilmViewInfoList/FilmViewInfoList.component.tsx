import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo } from 'react';

import { componentStyles } from './FilmViewInfoList.style';
import { FilmViewInfoListComponentProps } from './FilmViewInfoList.type';

export function FilmViewInfoListComponent({
  list,
  handleSelectCategory,
}: FilmViewInfoListComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const { name, position, link } = list;

  return (
    <ThemedPressable
      onPress={ () => handleSelectCategory(link) }
      style={ styles.infoListItem }
      contentStyle={ styles.infoListItemContent }
    >
      <ThemedText style={ styles.infoListName }>
        { `${name} ${position || ''}` }
      </ThemedText>
    </ThemedPressable>
  );
}

export default memo(
  FilmViewInfoListComponent,
  (prevProps, nextProps) => prevProps.list.link === nextProps.list.link
);
