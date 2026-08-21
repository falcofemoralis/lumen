import { FlashList } from '@shopify/flash-list';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedText } from 'Component/ThemedText';
import { useLandscape } from 'Hooks/useLandscape';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useCallback, useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';

import {
  componentStyles,
  MAX_ITEMS_TO_DISPLAY,
  MAX_ITEMS_TO_DISPLAY_LANDSCAPE,
  MAX_SCREEN_RATIO,
} from './ThemedSimpleList.style';
import { ListItem, ThemedSimpleListComponentProps } from './ThemedSimpleList.type';

export const ThemedListComponent = ({
  data,
  header,
  value,
  style,
  onChange,
  rightAdditionalElement,
  emptyComponent,
  searchComponent,
}: ThemedSimpleListComponentProps) => {
  const styles = useThemedStyles(componentStyles);
  const isLandscape = useLandscape();
  const { height: windowHeight } = useWindowDimensions();

  const selectedIndex = useMemo(() => data.findIndex((item) => item.value === value), [data, value]);

  // FlashList has no intrinsic height, so the wrapper needs an explicit one, and
  // it has to be a whole number of rows that actually fits on screen next to the
  // header. Anything taller is clipped by the overlay wrapping the list, and a
  // clipped ancestor cuts the last row with no way to scroll it into view.
  const viewportHeight = useMemo(() => {
    const itemHeight = styles.item.height;
    const availableHeight = windowHeight * MAX_SCREEN_RATIO
      - (header ? styles.header.height + styles.header.marginBottom : 0)
      - (searchComponent ? styles.search.height : 0);
    const visibleItems = Math.min(
      data.length,
      isLandscape ? MAX_ITEMS_TO_DISPLAY_LANDSCAPE : MAX_ITEMS_TO_DISPLAY,
      Math.max(1, Math.floor(availableHeight / itemHeight))
    );

    return visibleItems * itemHeight;
  }, [styles, header, searchComponent, windowHeight, isLandscape, data.length]);

  // The row-aligned height only makes sense for the list itself -- with no data
  // it collapses to zero and would clip the empty component, which sizes itself.
  const wrapperStyle = useMemo(
    () => [styles.items, data.length > 0 ? { height: viewportHeight } : undefined],
    [styles, viewportHeight, data.length]
  );

  // `initialScrollIndex` alone puts the selected item at the top of the
  // viewport. This offset is the same maths `scrollToIndex` applies for
  // `viewPosition: 0.5` (`layout.y - (viewport - item) * 0.5`), so the list
  // opens with the current value centred instead.
  const initialScrollIndexParams = useMemo(
    () => ({ viewOffset: -(viewportHeight - styles.item.height) / 2 }),
    [viewportHeight, styles]
  );

  const renderHeader = () => {
    if (!header) {
      return null;
    }

    return (
      <View style={ styles.header }>
        <ThemedText
          style={ styles.headerText }
          numberOfLines={ 1 }
        >
          { header }
        </ThemedText>
      </View>
    );
  };

  const renderSearch = () => {
    if (!searchComponent) {
      return null;
    }

    return (
      <View style={ styles.search }>
        { searchComponent }
      </View>
    );
  };

  const renderItem = useCallback(({ item }: { item: ListItem }) => (
    <ThemedButton
      title={ item.label }
      onPress={ () => { onChange(item); } }
      style={ styles.item }
      contentStyle={ [styles.itemContent, item.value === value && styles.listItemSelected] }
      textStyle={ styles.itemText }
      leftImage={ item.startIcon }
      leftImageStyle={ styles.icon }
      rightImage={ item.endIcon }
      rightImageStyle={ styles.icon }
      rightAdditionalElement={
        rightAdditionalElement ? (isFocused, selected) => rightAdditionalElement(item, isFocused, selected) : undefined
      }
    />
  ), [onChange, value, styles, rightAdditionalElement]);

  const keyExtractor = useCallback((item: ListItem) => item.value, []);

  const renderList = () => (
    <View style={ wrapperStyle }>
      { data.length > 0 ? (
        <FlashList
          data={ data }
          renderItem={ renderItem }
          keyExtractor={ keyExtractor }
          extraData={ selectedIndex }
          initialScrollIndex={ selectedIndex > 0 ? selectedIndex : undefined }
          initialScrollIndexParams={ initialScrollIndexParams }
        />
      ) : emptyComponent }
    </View>
  );

  return (
    <View style={ [styles.container, style] }>
      { renderHeader() }
      { renderSearch() }
      { renderList() }
    </View>
  );
};

export default ThemedListComponent;
