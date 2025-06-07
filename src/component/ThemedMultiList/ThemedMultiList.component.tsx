import { SquareCheckBig } from 'lucide-react-native';
import React, { useCallback } from 'react';
import {
  ScrollView, Text, TouchableHighlight, View,
} from 'react-native';
import { Colors } from 'Style/Colors';

import { styles } from './ThemedMultiList.style';
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
      <View style={ styles.listHeader }>
        <Text style={ styles.listHeaderText }>
          { header }
        </Text>
      </View>
    );
  };

  const renderItem = useCallback((item: ListItem) => (
    <View style={ styles.item }>
      <Text style={ styles.itemLabel }>
        { item.label }
      </Text>
      <SquareCheckBig
        color={ Colors.white }
      />
    </View>
  ), []);

  const renderContent = () => (
    <ScrollView
      style={ styles.listItems }
    >
      { values.map((item) => (
        <TouchableHighlight
          key={ item.value }
          underlayColor={ Colors.primary }
          onPress={ () => handleOnChange(item.value, !item.isChecked) }
          style={ styles.listItem }
        >
          <View style={ styles.listItem }>
            { renderItem(item) }
          </View>
        </TouchableHighlight>
      )) }
    </ScrollView>
  );

  return (
    <View style={ styles.listContainer }>
      { renderHeader() }
      { renderContent() }
    </View>
  );
};

export default ThemedMultiListComponent;
