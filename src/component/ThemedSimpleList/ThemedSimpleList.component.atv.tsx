import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import { useCallback, useRef } from 'react';
import { View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationVirtualizedList,
  SpatialNavigationVirtualizedListRef,
} from 'react-tv-space-navigation';

import { MAX_ITEMS_TO_DISPLAY, styles } from './ThemedSimpleList.style.atv';
import { ListItem, ThemedSimpleListComponentProps } from './ThemedSimpleList.type';

export const ThemedListComponent = ({
  data,
  header,
  value,
  style,
  onChange,
}: ThemedSimpleListComponentProps) => {
  const scrollViewRef = useRef<SpatialNavigationVirtualizedListRef>(null);

  const handleLayout = () => {
    setTimeout(() => {
      console.log('value', value);

      const itemIdx = data.findIndex((item) => item.value === value);

      console.log('handleLayout', itemIdx);

      // if (scrollViewRef.current && itemIdx !== -1) {
      //   scrollViewRef.current?.focus(itemIdx);
      // }
    }, 0);
  };

  const renderHeader = () => {
    if (!header) {
      return null;
    }

    return (
      <View style={ styles.header }>
        <ThemedText style={ styles.headerText }>
          { header }
        </ThemedText>
      </View>
    );
  };

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    const isSelected = value === item.value;

    return (
      <DefaultFocus enable={ isSelected }>
        <SpatialNavigationFocusableView
          onSelect={ () => onChange(item) }
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
        </SpatialNavigationFocusableView>
      </DefaultFocus>
    );
  }, [value, onChange]);

  const renderList = () => {
    console.log('renderList', data);

    return (
      <View
        style={ [
          styles.listItemsWrapper,
          { height: data.length >= (MAX_ITEMS_TO_DISPLAY - 1) ? undefined : (data.length * styles.item.height) },
        ] }
        onLayout={ handleLayout }
      >
        <SpatialNavigationVirtualizedList
          ref={ scrollViewRef }
          data={ data }
          renderItem={ renderItem }
          itemSize={ styles.item.height }
          orientation="vertical"
        />
      </View>
    );
  };

  return (
    <View style={ [styles.listContainer, style] }>
      { renderHeader() }
      { renderList() }
    </View>
  );
};

export default ThemedListComponent;
