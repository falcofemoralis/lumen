import { FocusContext, FocusHandler, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { FilmCard } from 'Component/FilmCard';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail.atv';
import { ScrollContext, useScrollContext } from 'Component/ThemedScrollView/ScrollContext';
import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { useDefaultFocus } from 'Hooks/useDefaultFocus';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, ReactElement, useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { componentStyles, ROW_GAP } from './FilmSections.style.atv';
import {
  FilmSectionsCardProps,
  FilmSectionsComponentProps,
  FilmSectionsFilmItem,
  FilmSectionsHeaderProps,
  FilmSectionsItem,
  FilmSectionsItemType,
} from './FilmSections.type';

type Styles = ThemedStyles<typeof componentStyles>;

type FilmSectionsExtraProps = {
  item: FilmSectionsFilmItem
}

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
}: FilmSectionsCardProps) => {
  const { scale } = useAppTheme();
  const { scrollTo } = useScrollContext();

  const onPress = useCallback(() => {
    const { isPlaceholder, film } = item;

    if (isPlaceholder) {
      return;
    }

    handleOnPress(film);
  }, [item, handleOnPress]);

  const { ref, focused } = useFocusable<FilmSectionsExtraProps>({
    // Loading placeholders must not be focusable: focusing one and then having
    // it swapped for the real film (different key -> unmount) makes Norigin
    // auto-restore focus, yanking the user around.
    focusable: !item.isPlaceholder,
    onFocus: (layout, props, details) => {
      scrollTo?.(layout, props, details);
    },
    extraProps: { item },
    onEnterPress: onPress,
  });

  const style = useMemo(() => ({
    marginHorizontal: scale(ROW_GAP) / 2,
  }), [scale]);

  const renderContent = () => {
    const { isPlaceholder, film } = item;

    if (isPlaceholder) {
      return <FilmCardThumbnail />;
    }

    return <FilmCard filmCard={ film } isFocused={ focused } />;
  };

  return (
    <Pressable
      ref={ ref }
      onPress={ onPress }
      style={ style }
      tvFocusable={ false }
    >
      { renderContent() }
    </Pressable>
  );
};

const MemoizedFilmSectionsHeader = memo(FilmSectionsHeader);
const MemoizedFilmSectionsCard = memo(FilmSectionsCard);

export function FilmSectionsComponent({
  data,
  children,
  autofocus,
  hasFilms,
  handleOnPress,
}: FilmSectionsComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const { scale } = useAppTheme();
  const { numberOfColumnsTV, isTVGridAnimation } = useConfigContext();

  const listRef = useRef<FlashListRef<FilmSectionsItem>>(null);
  const lastIndexRef = useRef(-1);

  const { ref, focusKey } = useFocusable<object, View>({
    saveLastFocusedChild: true,
  });

  // Focus the list (restoring the last focused card via saveLastFocusedChild)
  // on screen load/return. Enabled only once real films are in -- `data` is
  // never empty (it holds loading placeholders meanwhile) and Norigin cannot
  // focus a card that is not registered as focusable yet.
  useDefaultFocus(focusKey, !!autofocus && hasFilms);

  const scrollTo: FocusHandler<FilmSectionsExtraProps> = useCallback((_layout, props) => {
    const index = props?.item?.scrollIndex;

    // Only scroll when the focused row changes -- every card of a row shares
    // the same scrollIndex, so moving within a visible row must not trigger an
    // animated re-center, which competes with the focus render on the JS thread
    // and feels laggy.
    if (index === undefined || index === lastIndexRef.current) {
      return;
    }

    lastIndexRef.current = index;

    // Top of the list: scroll to the absolute offset rather than to the item.
    // scrollToIndex ignores the ListHeaderComponent's height and would align the
    // first item flush to the top, scrolling the screen header (e.g. the actor's
    // main data) off -- scrollToOffset(0) keeps it in view.
    if (index === 0) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });

      return;
    }

    listRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0,
    });
  }, []);

  const scrollContextValue = useMemo(() => ({ scrollTo }), [scrollTo]);

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
    layout.span = item.type === FilmSectionsItemType.HEADER ? numberOfColumnsTV : 1;
  }, [numberOfColumnsTV]);

  const keyExtractor = useCallback((item: FilmSectionsItem) => item.key, []);

  const contentContainerStyle = useMemo(() => ({
    paddingHorizontal: scale(ROW_GAP),
  }), [scale]);

  const ItemSeparator = useCallback(() => (
    <View style={ { height: scale(ROW_GAP) } } />
  ), [scale]);

  return (
    <FocusContext.Provider value={ focusKey }>
      <ScrollContext.Provider value={ scrollContextValue }>
        <View ref={ ref } style={ styles.grid } tvFocusable={ false }>
          <FlashList
            ref={ listRef }
            data={ data }
            renderItem={ renderItem }
            keyExtractor={ keyExtractor }
            getItemType={ getItemType }
            numColumns={ numberOfColumnsTV }
            overrideItemLayout={ overrideItemLayout }
            ItemSeparatorComponent={ ItemSeparator }
            ListHeaderComponent={ children as ReactElement }
            contentContainerStyle={ contentContainerStyle }
            showsVerticalScrollIndicator={ false }
            scrollAnimationEnabled={ isTVGridAnimation }
          />
        </View>
      </ScrollContext.Provider>
    </FocusContext.Provider>
  );
}

export default FilmSectionsComponent;
