import ThemedButton from 'Component/ThemedButton';
import ThemedImage from 'Component/ThemedImage';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedPressable from 'Component/ThemedPressable';
import { useOverlayContext } from 'Context/OverlayContext';
import { Plus } from 'lucide-react-native';
import React, { useCallback, useRef } from 'react';
import {
  ScrollView,
  Text,
  View,
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
    <View style={ styles.listItems }>
      <ScrollView
        ref={ scrollViewRef }
        onLayout={ handleLayout }
      >
        { data.map((item) => (
          <ThemedPressable
            key={ item.value }
            onPress={ () => { onChange(item); } }
            style={ styles.listItem }
            contentStyle={ [styles.listItemContent, item.value === value && styles.listItemSelected] }
          >
            { renderItem(item) }
          </ThemedPressable>
        )) }
      </ScrollView>
    </View>
  );

  const renderContent = () => (
    <View style={ styles.listContainer }>
      { renderHeader() }
      { renderList() }
    </View>
  );

  const renderModal = () => {
    if (asList) {
      return renderContent();
    }

    return (
      <ThemedOverlay
        id={ id.current }
        onHide={ () => goToPreviousOverlay() }
        containerStyle={ styles.overlay }
        contentContainerStyle={ styles.overlayContent }
      >
        { renderContent() }
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
        contentStyle={ styles.inputContent }
        textStyle={ styles.inputText }
        rightImageStyle={ styles.inputImage }
        onPress={ () => openOverlay(id.current) }
        IconComponent={ Plus }
        iconProps={ {
          color: Colors.text,
          size: 18,
        } }
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
