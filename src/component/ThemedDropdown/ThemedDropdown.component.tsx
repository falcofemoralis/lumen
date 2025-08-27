import ThemedButton from 'Component/ThemedButton';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedSimpleList from 'Component/ThemedSimpleList';
import { useOverlayContext } from 'Context/OverlayContext';
import { Plus } from 'lucide-react-native';
import React, { useRef } from 'react';
import { View } from 'react-native';
import { Colors } from 'Style/Colors';
import { generateId } from 'Util/Math';

import { styles } from './ThemedDropdown.style';
import { ThemedDropdownComponentProps } from './ThemedDropdown.type';

export const ThemedDropdownComponent = ({
  inputStyle,
  inputLabel,
  data,
  value,
  header,
  asOverlay,
  overlayId,
  onChange,
  style,
}: ThemedDropdownComponentProps) => {
  const { openOverlay, goToPreviousOverlay } = useOverlayContext();
  const id = useRef(overlayId ?? generateId());

  const renderModal = () => {
    return (
      <ThemedOverlay
        id={ id.current }
        onHide={ () => goToPreviousOverlay() }
        containerStyle={ styles.overlay }
        contentContainerStyle={ styles.overlayContent }
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
