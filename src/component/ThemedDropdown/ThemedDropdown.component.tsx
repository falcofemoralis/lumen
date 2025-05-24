import ThemedButton from 'Component/ThemedButton';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedOverlay from 'Component/ThemedOverlay';
import { useOverlayContext } from 'Context/OverlayContext';
import React, { useCallback, useRef } from 'react';
import {
  ScrollView, Text, TouchableHighlight, View,
} from 'react-native';
import { Colors } from 'Style/Colors';
import { generateId } from 'Util/Math';

import { styles } from './ThemedDropdown.style';
import { DropdownItem, ThemedDropdownComponentProps } from './ThemedDropdown.type';

export const ThemedDropdownComponent = ({
  inputStyle,
  inputLabel,
  data,
  value,
  header,
  asOverlay,
  overlayId,
  asList,
  onChange,
  style,
}: ThemedDropdownComponentProps) => {
  const { openOverlay, goToPreviousOverlay } = useOverlayContext();
  const id = useRef(overlayId ?? generateId());
  const scrollViewRef = useRef<ScrollView>(null);

  const handleLayout = () => {
    const itemIdx = data.findIndex((item) => item.value === value);

    if (itemIdx <= 5) {
      return;
    }

    const scrollIndex = itemIdx + 2;

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: scrollIndex * styles.item.height, animated: false });
    }
  };

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

  const renderList = () => (
    <ScrollView
      ref={ scrollViewRef }
      style={ styles.listItems }
      onLayout={ handleLayout }
    >
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
  );

  const renderContent = () => (
    <>
      { renderHeader() }
      { renderList() }
    </>
  );

  const renderModal = () => {
    if (asList) {
      return (
        <View style={ styles.listContainer }>
          { renderContent() }
        </View>
      );
    }

    return (
      <ThemedOverlay
        id={ id.current }
        onHide={ () => goToPreviousOverlay() }
        containerStyle={ styles.container }
        contentContainerStyle={ styles.contentContainer }
      >
        <View style={ styles.listContainer }>
          { renderContent() }
        </View>
      </ThemedOverlay>
    );
  };

  const renderInput = () => {
    if (asOverlay || asList) {
      return null;
    }

    const { label, endIcon } = data.find((item) => item.value === value) ?? {};

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
        onPress={ () => openOverlay(id.current) }
        rightImage={ endIcon }
      >
        { inputLabel ?? label }
      </ThemedButton>
    );
  };

  return (
    <View style={ style }>
      { renderModal() }
      { renderInput() }
    </View>
  );
};

export default ThemedDropdownComponent;
