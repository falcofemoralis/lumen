import { FlashList } from '@shopify/flash-list';
import { FilmCard } from 'Component/FilmCard';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail';
import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, ReactElement, useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { componentStyles, ROW_GAP } from './FilmSections.style';
import {
  FilmSectionsCardProps,
  FilmSectionsComponentProps,
  FilmSectionsHeaderProps,
  FilmSectionsItem,
  FilmSectionsItemType,
} from './FilmSections.type';

type Styles = ThemedStyles<typeof componentStyles>;

const FilmSectionsHeader = ({
  header,
  styles,
}: FilmSectionsHeaderProps & { styles: Styles }) => (
  <View style={ styles.header }>
    <ThemedText style={ styles.headerText }>
      { header }
    </ThemedText>
  </View>
);

const FilmSectionsCard = ({
  item,
  handleOnPress,
  styles,
}: FilmSectionsCardProps & { styles: Styles }) => {
  const { isPlaceholder, film } = item;
  const { scale } = useAppTheme();

  const style = useMemo(() => ({
    marginHorizontal: scale(ROW_GAP) / 2,
  }), [scale]);

  if (isPlaceholder) {
    return (
      <FilmCardThumbnail />
    );
  }

  return (
    <Pressable
      onPress={ () => handleOnPress(film) }
      style={ style }
    >
      <FilmCard
        filmCard={ film }
      />
    </Pressable>
  );
};

const MemoizedFilmSectionsHeader = memo(FilmSectionsHeader);
const MemoizedFilmSectionsCard = memo(FilmSectionsCard);

export function FilmSectionsComponent({
  data,
  stickyHeaderIndices,
  children,
  handleOnPress,
}: FilmSectionsComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const { scale } = useAppTheme();
  const { numberOfColumnsMobile } = useConfigContext();

  const renderItem = useCallback(({ item }: { item: FilmSectionsItem }) => {
    if (item.type === FilmSectionsItemType.HEADER) {
      return (
        <MemoizedFilmSectionsHeader
          header={ item.header }
          styles={ styles }
        />
      );
    }

    if (item.type !== FilmSectionsItemType.FILM) {
      return null;
    }

    return (
      <MemoizedFilmSectionsCard
        item={ item }
        handleOnPress={ handleOnPress }
        styles={ styles }
      />
    );
  }, [styles, handleOnPress]);

  // Headers and cards differ wildly in height, so recycle them separately --
  // and so do real cards and their loading placeholders.
  const getItemType = useCallback((item: FilmSectionsItem) => {
    if (item.type !== FilmSectionsItemType.FILM) {
      return item.type;
    }

    return item.isPlaceholder ? 'placeholder' : FilmSectionsItemType.FILM;
  }, []);

  // Cards take one grid column; a header takes the whole width, which also
  // pushes the next section onto a fresh row.
  const overrideItemLayout = useCallback((
    layout: { span?: number },
    item: FilmSectionsItem
  ) => {
    layout.span = item.type === FilmSectionsItemType.HEADER ? numberOfColumnsMobile : 1;
  }, [numberOfColumnsMobile]);

  const keyExtractor = useCallback((item: FilmSectionsItem) => item.key, []);

  const contentContainerStyle = useMemo(() => ({
    paddingHorizontal: scale(ROW_GAP),
  }), [scale]);

  const ItemSeparator = useCallback(() => (
    <View style={ { height: scale(ROW_GAP) } } />
  ), [scale]);

  return (
    <FlashList
      data={ data }
      renderItem={ renderItem }
      keyExtractor={ keyExtractor }
      getItemType={ getItemType }
      numColumns={ numberOfColumnsMobile }
      overrideItemLayout={ overrideItemLayout }
      ItemSeparatorComponent={ ItemSeparator }
      stickyHeaderIndices={ stickyHeaderIndices }
      ListHeaderComponent={ children as ReactElement }
      contentContainerStyle={ contentContainerStyle }
      showsVerticalScrollIndicator={ false }
    />
  );
}

export default FilmSectionsComponent;
