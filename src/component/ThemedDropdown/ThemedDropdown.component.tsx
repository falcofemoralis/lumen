import ThemedButton from 'Component/ThemedButton';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedOverlay from 'Component/ThemedOverlay';
import React, { useCallback, useRef } from 'react';
import {
  ScrollView, Text, TouchableHighlight, View,
} from 'react-native';
import OverlayStore from 'Store/Overlay.store';
import Colors from 'Style/Colors';
import { generateId } from 'Util/Math';

import { styles } from './ThemedDropdown.style';
import { DropdownItem, ThemedDropdownComponentProps } from './ThemedDropdown.type';

export const ThemedDropdownComponent = ({
  inputStyle,
  data,
  value,
  header,
  asOverlay,
  overlayId,
  asList,
  onChange,
}: ThemedDropdownComponentProps<any>) => {
  const id = useRef(overlayId ?? generateId());

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

  const renderContent = () => (
    <>
      { renderHeader() }
      <ScrollView style={ styles.listItems }>
        { data.map((item) => (
          <TouchableHighlight
            key={ item.value }
            underlayColor={ Colors.primary }
            onPress={ () => { onChange(item); } }
            style={ styles.listItem }
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
      </ScrollView>
    </>
  );

  const renderModal = () => {
    if (asList) {
      return (
        <View style={ styles.listContainer }>
          <View style={ styles.contentContainer }>
            { renderContent() }
          </View>
        </View>
      );
    }

    return (
      <ThemedOverlay
        id={ id.current }
        onHide={ () => OverlayStore.goToPreviousOverlay() }
        containerStyle={ styles.container }
        contentContainerStyle={ styles.contentContainer }
      >
        { renderContent() }
      </ThemedOverlay>
    );
  };

  const renderInput = () => {
    if (asOverlay || asList) {
      return null;
    }

    const { label, endIcon } = data.find((item) => item.value === value);

    return (
      <ThemedButton
        style={ [styles.input, inputStyle] }
        iconStyle={ styles.inputIcon }
        textStyle={ styles.inputText }
        rightImageStyle={ styles.inputImage }
        icon={ {
          name: 'plus',
          pack: IconPackType.Octicons,
        } }
        onPress={ () => OverlayStore.openOverlay(id.current) }
        rightImage={ endIcon }
      >
        { label }
      </ThemedButton>
    );
  };

  return (
    <View>
      { renderModal() }
      { renderInput() }
    </View>
  );
};

export default ThemedDropdownComponent;
