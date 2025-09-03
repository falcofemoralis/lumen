import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import {
  SpatialNavigationFocusableView,
  SpatialNavigationNodeRef,
  SpatialNavigationScrollView,
} from 'react-tv-space-navigation';

import { styles } from './ThemedSimpleList.style.atv';
import { ListItem, ThemedSimpleListComponentProps } from './ThemedSimpleList.type';

export const ThemedListComponent = ({
  data,
  header,
  value,
  style,
  onChange,
}: ThemedSimpleListComponentProps) => {
  const defaultItemRef = useRef<SpatialNavigationNodeRef>(null);

  useEffect(() => {
    setTimeout(() => {
      if (defaultItemRef.current) {
        defaultItemRef.current?.focus();
      }
    }, 0);
  }, []);

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
      <SpatialNavigationFocusableView
        key={ `${item.value}-simplelist-item` }
        // this should fix the issue when list scrolls to the top
        // but seems like it's not working
        ref={ isSelected ? defaultItemRef : null }
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
    );
  }, [value, onChange]);

  const renderList = () => (
    <View style={ styles.listItems }>
      <SpatialNavigationScrollView
        useNativeScroll
      >
        { data.map((item) => renderItem({ item })) }
      </SpatialNavigationScrollView>
    </View>
  );

  return (
    <View style={ [styles.listContainer, style] }>
      { renderHeader() }
      { renderList() }
    </View>
  );
};

export default ThemedListComponent;
