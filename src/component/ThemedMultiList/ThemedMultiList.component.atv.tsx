import { Square, SquareCheck } from 'lucide-react-native';
import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationVirtualizedList,
} from 'react-tv-space-navigation';
import { Colors } from 'Style/Colors';

import { styles } from './ThemedMultiList.style.atv';
import { ListItem, ThemedMultiListComponentProps } from './ThemedMultiList.type';

export const ThemedMultiListComponent = ({
  values,
  header,
  handleOnChange,
}: ThemedMultiListComponentProps) => {
  const renderHeader = () => {
    if (!header) {
      return null;
    }

    return (
      <View style={ styles.header }>
        <Text style={ styles.headerText }>
          { header }
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: ListItem }) => (
    <SpatialNavigationFocusableView
      key={ `${item.value}-multilist-item` }
      onSelect={ () => { handleOnChange(item.value, !item.isChecked); } }
    >
      { ({ isFocused }) => (
        <View style={ [
          styles.item,
          isFocused && styles.itemFocused,
        ] }
        >
          <View style={ styles.itemContainer }>
            <Text style={ [
              styles.text,
              isFocused && styles.textFocused,
            ] }
            >
              { item.label }
            </Text>
          </View>
          { item.isChecked ? (
            <SquareCheck
              color={ Colors.primary }
            />
          ) : (
            <Square
              color={ isFocused ? Colors.black : Colors.white }
            />
          ) }
        </View>
      ) }
    </SpatialNavigationFocusableView>
  );

  const renderContent = () => (
    <View
      style={ styles.scrollViewContainer }
    >
      <DefaultFocus>
        <SpatialNavigationVirtualizedList
          style={ styles.scrollView }
          data={ values }
          renderItem={ renderItem }
          itemSize={ styles.item.height }
          orientation="vertical"
          scrollBehavior='stick-to-center'
        />
      </DefaultFocus>
    </View>
  );

  return (
    <View style={ styles.listContainer }>
      <View style={ styles.contentContainer }>
        { renderHeader() }
        { renderContent() }
      </View>
    </View>
  );
};

export default ThemedMultiListComponent;
