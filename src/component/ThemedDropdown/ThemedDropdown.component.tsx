import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedOverlay from 'Component/ThemedOverlay';
import { useCallback, useRef } from 'react';
import { Text, TouchableHighlight, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import OverlayStore from 'Store/Overlay.store';
import Colors from 'Style/Colors';
import { scale } from 'Util/CreateStyles';
import { noopFn } from 'Util/Function';
import { generateId } from 'Util/Math';

import { styles } from './ThemedDropdown.style';
import { DropdownItem, ThemedDropdownProps } from './ThemedDropdown.type';

/**
 * https://github.com/hoaphantn7604/react-native-element-dropdown#readme
 * @param props
 * @returns
 */
export const ThemedDropdownComponent = ({
  style,
  asList,
  asOverlay,
  overlayId,
  containerStyle,
  ...props
}: ThemedDropdownProps) => {
  const id = useRef(overlayId ?? generateId());

  const renderItem = useCallback((item: DropdownItem) => (
    <View style={ styles.item }>
      { item.startIcon && (
        <ThemedImage
          style={ styles.icon }
          src={ item.startIcon }
        />
      ) }
      <Text style={ styles.itemLabel }>
        { item.label }
      </Text>
      { item.endIcon && (
        <ThemedImage
          style={ styles.icon }
          src={ item.endIcon }
        />
      ) }
    </View>
  ), []);

  const renderList = () => {
    const { data, onChange = noopFn, value } = props;

    return (
      <View style={ style }>
        { data.map((item) => (
          <TouchableHighlight
            key={ item.value }
            underlayColor={ Colors.primary }
            onPress={ () => { onChange(item); } }
          >
            <View style={ [
              styles.listItem,
              item.value === value && styles.listItemSelected,
            ] }
            >
              { renderItem(item) }
            </View>
          </TouchableHighlight>
        )) }
      </View>
    );
  };

  const renderDropdown = () => (
    <Dropdown
      maxHeight={ 300 }
      labelField="label"
      valueField="value"
      renderItem={ renderItem }
      autoScroll={ false }
      { ...props }
      containerStyle={ styles.content }
      activeColor={ Colors.primary }
      searchPlaceholderTextColor={ Colors.white }
      style={ [styles.input, style] }
      selectedTextProps={ { style: styles.inputText } }
      renderLeftIcon={ () => (
        <ThemedIcon
          style={ styles.inputIcon }
          icon={ {
            name: 'plus',
            pack: IconPackType.Octicons,
          } }
          color="white"
          size={ scale(16) }
        />
      ) }
      renderRightIcon={ () => null }
    />
  );

  const renderContent = () => {
    if (asList) {
      return renderList();
    }

    return renderDropdown();
  };

  if (asOverlay) {
    return (
      <ThemedOverlay
        id={ id.current }
        onHide={ () => OverlayStore.goToPreviousOverlay() }
        contentContainerStyle={ [styles.container, containerStyle] }
      >
        { renderContent() }
      </ThemedOverlay>
    );
  }

  return renderContent();
};

export default ThemedDropdownComponent;
