import React, { useCallback } from 'react';
import {
  Text,
  View,
} from 'react-native';
import { DefaultFocus, SpatialNavigationFocusableView, SpatialNavigationScrollView } from 'react-tv-space-navigation';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

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

  const renderItem = (item: ListItem, idx: number) => (
    <SpatialNavigationFocusableView
      key={ `${item.value}-${idx}1` }
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
          { /* <Checkbox
            status={ item.isChecked ? 'checked' : 'unchecked' }
            color={ Colors.primary }
          /> */ }
        </View>
      ) }
    </SpatialNavigationFocusableView>
  );

  const renderContent = () => (
    <SpatialNavigationScrollView
      offsetFromStart={ scale(64) }
    >
      <DefaultFocus>
        { values.map((item, index) => renderItem(item, index)) }
      </DefaultFocus>
    </SpatialNavigationScrollView>
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
