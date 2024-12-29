import ThemedImage from 'Component/ThemedImage';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

import { styles } from './ThemedDropdown.style';
import { DropdownItem, ThemedDropdownProps } from './ThemedDropdown.type';

export const ThemedDropdownComponent = ({
  style,
  selectedTextStyle,
  ...props
}: ThemedDropdownProps) => {
  const renderItem = useCallback((item: DropdownItem) => (
    <View style={ styles.item }>
      { item.startIcon && (
        <ThemedImage
          style={ styles.icon }
          src={ item.startIcon }
        />
      ) }
      <Text style={ styles.textItem }>{ item.label }</Text>
      { item.endIcon && (
        <ThemedImage
          style={ styles.icon }
          src={ item.endIcon }
        />
      ) }
    </View>
  ), []);

  return (
    <Dropdown
      maxHeight={ 300 }
      labelField="label"
      valueField="value"
      renderItem={ renderItem }
      autoScroll={ false }
      { ...props }
      style={ [styles.container, style] }
      selectedTextStyle={ [styles.selectedTextStyle, selectedTextStyle] }
    />
  );
};

export default ThemedDropdownComponent;
