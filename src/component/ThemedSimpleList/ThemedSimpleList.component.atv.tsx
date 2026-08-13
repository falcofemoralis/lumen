import { getCurrentFocusKey, setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import { FocusContext, FocusHandler, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { ThemedButton } from 'Component/ThemedButton';
import { ScrollContext } from 'Component/ThemedScrollView/ScrollContext';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, ReactElement, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { componentStyles, MAX_ITEMS_TO_DISPLAY, MAX_SCREEN_RATIO } from './ThemedSimpleList.style.atv';
import { ListItem, ThemedSimpleListComponentProps } from './ThemedSimpleList.type';

type ListItemExtraProps = {
  index: number;
}

type RegisterItem = (index: number, focusKey: string) => () => void;

type SimpleListItemProps = {
  item: ListItem;
  index: number;
  isSelected: boolean;
  registerItem: RegisterItem;
  styles: ReturnType<typeof componentStyles>;
  onChange: (item: ListItem) => void;
  rightAdditionalElement?: (item: ListItem, isFocused: boolean, isSelected: boolean) => ReactElement | null;
}

// The focus key MUST stay tied to the component instance (never derived from
// `index` or `item.value`): FlashList recycles this instance across data
// indices, and Norigin registers a node once on mount and never re-keys it. A
// data-derived key would leave the registry holding the key this cell had when
// it first mounted -- and since `updateFocusable` no-ops for an unknown key, the
// recycled node also keeps its stale `extraProps`, so focusing it scrolls the
// list to whatever index it used to render. `registerItem` keeps the
// index -> live focus key mapping instead, updated on every recycle.
function SimpleListItem({
  item,
  index,
  isSelected,
  registerItem,
  styles,
  onChange,
  rightAdditionalElement,
}: SimpleListItemProps) {
  const focusKey = useId();

  useEffect(() => registerItem(index, focusKey), [index, focusKey, registerItem]);

  return (
    <ThemedButton
      title={ item.label }
      focusKey={ focusKey }
      extraProps={ { index } as ListItemExtraProps }
      onPress={ () => onChange(item) }
      style={ styles.item }
      contentStyle={ styles.itemContent }
      textStyle={ styles.itemText }
      leftImage={ item.startIcon }
      leftImageStyle={ styles.icon }
      rightImage={ item.endIcon }
      rightImageStyle={ styles.icon }
      selected={ isSelected }
      rightAdditionalElement={
        rightAdditionalElement ? (isFocused, selected) => rightAdditionalElement(item, isFocused, selected) : undefined
      }
    />
  );
}

const MemoizedListItem = memo(SimpleListItem);

export const ThemedListComponent = ({
  data,
  header,
  value,
  style,
  onChange,
  rightAdditionalElement,
  emptyComponent,
}: ThemedSimpleListComponentProps) => {
  const styles = useThemedStyles(componentStyles);
  const listRef = useRef<FlashListRef<ListItem>>(null);
  const hasScrolledRef = useRef(false);
  const { height: windowHeight } = useWindowDimensions();

  const selectedIndex = useMemo(() => data.findIndex((item) => item.value === value), [data, value]);

  // Live index -> focus key map of the items FlashList currently has mounted.
  // Rebuilt continuously as items are recycled, so it always points at the node
  // that actually renders a given index.
  const itemKeysRef = useRef(new Map<number, string>());
  const selectedIndexRef = useRef(selectedIndex);
  const [selectedFocusKey, setSelectedFocusKey] = useState<string>();

  const registerItem = useCallback<RegisterItem>((index, itemFocusKey) => {
    itemKeysRef.current.set(index, itemFocusKey);

    if (index === selectedIndexRef.current) {
      setSelectedFocusKey(itemFocusKey);
    }

    return () => {
      // Only drop the entry if it is still ours: on recycle React runs this
      // cleanup after the item that took over the index has already claimed it.
      if (itemKeysRef.current.get(index) === itemFocusKey) {
        itemKeysRef.current.delete(index);
      }
    };
  }, []);

  // Follow the selection when it changes under already mounted items -- the
  // registration above only fires when an item mounts or is recycled. Child
  // effects run before this one, so items registering in the same commit have
  // already seen the previous value through the ref and are re-resolved here.
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
    setSelectedFocusKey(itemKeysRef.current.get(selectedIndex));
  }, [selectedIndex]);

  // The selected item is focused through this key alone -- never with an
  // explicit setFocus. FlashList needs its container layout before it renders
  // any item, so a claim made on mount would resolve to the topmost rendered
  // item and a later setFocus would move focus a second time, animating the list
  // from that item to the selected one.
  const { ref, focusKey } = useFocusable<object, View>({
    preferredChildFocusKey: selectedFocusKey,
  });

  // FlashList needs its container layout before it renders any row, so on the
  // first open there is nothing registered for an incoming claim to resolve to
  // -- Norigin lands it on this node instead and the list looks unfocused. (Open
  // it a second time and the rows mount early enough that the preferred key is
  // already there, which is why it only ever misses the first time.) Take the
  // claim once the selected row has registered, but only while it is still
  // parked here: a row that already holds focus must keep it.
  useEffect(() => {
    if (selectedFocusKey && getCurrentFocusKey() === focusKey) {
      setFocus(selectedFocusKey);
    }
  }, [selectedFocusKey, focusKey]);

  const scrollTo: FocusHandler<ListItemExtraProps> = useCallback((_layout, props) => {
    if (props?.index === undefined) {
      return;
    }

    // The first focus is the list opening on its selected item -- it must land
    // there instantly. `initialScrollIndexParams` already positions it, so this
    // is normally a no-op, but any rounding against the measured layout would
    // otherwise animate.
    const animated = hasScrolledRef.current;

    hasScrolledRef.current = true;

    listRef.current?.scrollToIndex({
      index: props.index,
      animated,
      viewPosition: 0.5,
    });
  }, []);

  const scrollContextValue = useMemo(() => ({ scrollTo }), [scrollTo]);

  const renderItem = useCallback(({ item, index }: { item: ListItem; index: number }) => (
    <MemoizedListItem
      item={ item }
      index={ index }
      isSelected={ index === selectedIndex }
      registerItem={ registerItem }
      styles={ styles }
      onChange={ onChange }
      rightAdditionalElement={ rightAdditionalElement }
    />
  ), [selectedIndex, registerItem, styles, onChange, rightAdditionalElement]);

  const keyExtractor = useCallback((item: ListItem) => item.value, []);

  // FlashList has no intrinsic height, so the wrapper needs an explicit one, and
  // it has to be a whole number of rows that actually fits on screen next to the
  // header. Anything taller is clipped by the overlay, and a clipped ancestor
  // both cuts the last row and starts scrolling its own content -- header
  // included -- as soon as a hidden child is focused or hovered.
  const viewportHeight = useMemo(() => {
    const itemHeight = styles.item.height;
    const availableHeight = windowHeight * MAX_SCREEN_RATIO - (header ? styles.header.height : 0);
    const visibleItems = Math.min(
      data.length,
      MAX_ITEMS_TO_DISPLAY,
      Math.max(1, Math.floor(availableHeight / itemHeight))
    );

    return visibleItems * itemHeight;
  }, [styles, header, windowHeight, data.length]);

  // The row-aligned height only makes sense for the list itself -- with no data
  // it collapses to zero and would clip the empty component, which sizes itself.
  const wrapperStyle = useMemo(
    () => [styles.listItemsWrapper, data.length > 0 ? { height: viewportHeight } : undefined],
    [styles, viewportHeight, data.length]
  );

  // `initialScrollIndex` alone puts the selected item at the top of the
  // viewport, which the focus handler then animates to the centre -- a visible
  // jump every time the list opens on anything but the first item. This offset
  // is the same maths `scrollToIndex` applies for `viewPosition: 0.5`
  // (`layout.y - (viewport - item) * 0.5`), so the list starts out exactly where
  // that first focus wants it and nothing moves.
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

  const renderList = () => (
    <FocusContext.Provider value={ focusKey }>
      <ScrollContext.Provider value={ scrollContextValue }>
        <View
          ref={ ref }
          style={ wrapperStyle }
          tvFocusable={ false }
        >
          { data.length > 0 ? (
            <FlashList
              ref={ listRef }
              data={ data }
              renderItem={ renderItem }
              keyExtractor={ keyExtractor }
              extraData={ selectedIndex }
              initialScrollIndex={ selectedIndex > 0 ? selectedIndex : undefined }
              initialScrollIndexParams={ initialScrollIndexParams }
            />
          ) : emptyComponent }
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
