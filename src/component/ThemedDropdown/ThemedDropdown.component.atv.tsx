import ThemedButton from 'Component/ThemedButton';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedSimpleList from 'Component/ThemedSimpleList';
import { useOverlayContext } from 'Context/OverlayContext';
import { Plus } from 'lucide-react-native';
import React, { memo, useRef } from 'react';
import { View } from 'react-native';
import { generateId } from 'Util/Math';

import { styles } from './ThemedDropdown.style.atv';
import { ThemedDropdownComponentProps } from './ThemedDropdown.type';

export const ThemedDropdownComponent = ({
  inputStyle,
  data,
  value,
  header,
  asOverlay,
  overlayId: overlayIdProp,
  style,
  onChange,
}: ThemedDropdownComponentProps) => {
  const { openOverlay, goToPreviousOverlay } = useOverlayContext();
  const overlayId = useRef(overlayIdProp ?? generateId());

  const renderModal = () => {
    return (
      <ThemedOverlay
        id={ overlayId.current }
        onHide={ () => goToPreviousOverlay() }
        containerStyle={ styles.container }
        contentContainerStyle={ styles.contentContainer }
      >
        <ThemedSimpleList
          data={ data }
          value={ value }
          header={ header }
          onChange={ onChange }
        />
      </ThemedOverlay>
    );
  };

  const renderInput = () => {
    if (asOverlay) {
      return null;
    }

    const { label, endIcon } = data.find((item) => item.value === value) ?? {};

    return (
      <ThemedButton
        style={ [styles.input, inputStyle] }
        rightImageStyle={ styles.inputImage }
        IconComponent={ Plus }
        onPress={ () => openOverlay(overlayId.current) }
        rightImage={ endIcon }
      >
        { label }
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

export default memo(ThemedDropdownComponent);
