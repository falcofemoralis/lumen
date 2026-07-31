import { setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import { FocusContext, FocusHandler, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ScrollContext } from 'Component/ThemedScrollView/ScrollContext';
import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { componentStyles, MAX_ITEMS_TO_DISPLAY, MAX_SCREEN_RATIO } from './ThemedSimpleList.style.atv';
import { ListItem, ThemedSimpleListComponentProps } from './ThemedSimpleList.type';

type ListItemExtraProps = {
  index: number;
}

type SimpleListItemProps = {
  item: ListItem;
  index: number;
  isSelected: boolean;
  focusKey: string;
  styles: ReturnType<typeof componentStyles>;
  onChange: (item: ListItem) => void;
}

function SimpleListItem({
  item,
  index,
  isSelected,
  focusKey,
  styles,
  onChange,
}: SimpleListItemProps) {
  return (
    <ThemedPressable
      focusKey={ focusKey }
      extraProps={ { index } as ListItemExtraProps }
      onPress={ () => onChange(item) }
    >
      { ({ isFocused }) => (
        <View
          style={ [
            styles.item,
            isSelected && styles.itemSelected,
            isFocused && styles.itemFocused,
          ] }
        >
          <View style={ styles.itemContainer }>
            { item.startIcon && (
              <ThemedImage
                style={ styles.icon }
                src={ item.startIcon }
              />
            ) }
            <ThemedText
              style={ [
                styles.text,
                isSelected && styles.textSelected,
                isFocused && styles.textFocused,
              ] }
            >
              { item.label }
            </ThemedText>
            { item.endIcon && (
              <ThemedImage
                style={ styles.icon }
                src={ item.endIcon }
              />
            ) }
          </View>
        </View>
      ) }
    </ThemedPressable>
  );
}

const MemoizedListItem = memo(SimpleListItem);

export const ThemedListComponent = ({
  data,
  header,
  value,
  style,
  onChange,
}: ThemedSimpleListComponentProps) => {
  const styles = useThemedStyles(componentStyles);
  const listRef = useRef<FlashListRef<ListItem>>(null);
  const listId = useId();
  const hasAutoFocusedRef = useRef(false);
  const { height: windowHeight } = useWindowDimensions();

  const selectedIndex = useMemo(() => data.findIndex((item) => item.value === value), [data, value]);

  const getItemFocusKey = useCallback(
    (index: number) => `simple-list-${listId}-item-${index}`,
    [listId]
  );

  const { ref, focusKey } = useFocusable<object, View>({
    preferredChildFocusKey: data.length > 0
      ? getItemFocusKey(selectedIndex !== -1 ? selectedIndex : 0)
      : undefined,
  });

  useEffect(() => {
    if (!hasAutoFocusedRef.current && selectedIndex !== -1) {
      hasAutoFocusedRef.current = true;
      setFocus(getItemFocusKey(selectedIndex));
    }
  }, [selectedIndex, getItemFocusKey]);

  const scrollTo: FocusHandler<ListItemExtraProps> = useCallback((_layout, props) => {
    if (props?.index === undefined) {
      return;
    }

    listRef.current?.scrollToIndex({
      index: props.index,
      animated: true,
      viewPosition: 0.5,
    });
  }, []);

  const scrollContextValue = useMemo(() => ({ scrollTo }), [scrollTo]);

  const renderItem = useCallback(({ item, index }: { item: ListItem; index: number }) => (
    <MemoizedListItem
      item={ item }
      index={ index }
      isSelected={ index === selectedIndex }
      focusKey={ getItemFocusKey(index) }
      styles={ styles }
      onChange={ onChange }
    />
  ), [selectedIndex, getItemFocusKey, styles, onChange]);

  const keyExtractor = useCallback((item: ListItem) => item.value, []);

  // FlashList has no intrinsic height, so the wrapper needs an explicit one, and
  // it has to be a whole number of rows that actually fits on screen next to the
  // header. Anything taller is clipped by the overlay, and a clipped ancestor
  // both cuts the last row and starts scrolling its own content -- header
  // included -- as soon as a hidden child is focused or hovered.
  const wrapperStyle = useMemo(() => {
    const itemHeight = styles.item.height;
    const availableHeight = windowHeight * MAX_SCREEN_RATIO - (header ? styles.header.height : 0);
    const visibleItems = Math.min(
      data.length,
      MAX_ITEMS_TO_DISPLAY,
      Math.max(1, Math.floor(availableHeight / itemHeight))
    );

    return [styles.listItemsWrapper, { height: visibleItems * itemHeight }];
  }, [styles, header, windowHeight, data.length]);

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

  const renderList = () => (
    <FocusContext.Provider value={ focusKey }>
      <ScrollContext.Provider value={ scrollContextValue }>
        <View
          ref={ ref }
          style={ wrapperStyle }
          tvFocusable={ false }
        >
          { data.length > 0 && (
            <FlashList
              ref={ listRef }
              data={ data }
              renderItem={ renderItem }
              keyExtractor={ keyExtractor }
              extraData={ selectedIndex }
              initialScrollIndex={ selectedIndex > 0 ? selectedIndex : undefined }
              showsVerticalScrollIndicator={ false }
            />
          ) }
        </View>
      </ScrollContext.Provider>
    </FocusContext.Provider>
  );

  return (
    <View style={ [styles.listContainer, style] }>
      { renderHeader() }
      { renderList() }
    </View>
  );
};

export default ThemedListComponent;
