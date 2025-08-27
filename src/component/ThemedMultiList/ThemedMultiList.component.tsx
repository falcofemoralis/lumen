import ThemedList from 'Component/ThemedList';
import { useLandscape } from 'Hooks/useLandscape';
import { Square, SquareCheck } from 'lucide-react-native';
import React, { useCallback } from 'react';
import {
  Text,
  View,
} from 'react-native';
import { Colors } from 'Style/Colors';

import { styles } from './ThemedMultiList.style';
import { ListItem, ThemedMultiListComponentProps } from './ThemedMultiList.type';

export const ThemedMultiListComponent = ({
  values,
  header,
  handleOnChange,
}: ThemedMultiListComponentProps) => {
  const isLandscape = useLandscape();

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
      { item.isChecked ? (
        <SquareCheck
          color={ Colors.secondary }
        />
      ) : (
        <Square
          color={ Colors.white }
        />
      ) }
    </View>
  ), []);

  const renderContent = () => (
    <View
      style={ [
        styles.listItems,
        isLandscape && styles.listItemsLandscape,
      ] }
    >
      <ThemedList
        data={ values }
        renderItem={ renderItem }
        estimatedItemSize={ styles.item.height }
      />
    </View>
  );

  return (
    <View style={ styles.listContainer }>
      { renderHeader() }
      { renderContent() }
    </View>
  );
};

export default ThemedMultiListComponent;
