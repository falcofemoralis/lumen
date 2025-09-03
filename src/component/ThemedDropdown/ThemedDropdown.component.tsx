import ThemedButton from 'Component/ThemedButton';
import ThemedOverlay from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import ThemedSimpleList from 'Component/ThemedSimpleList';
import { Plus } from 'lucide-react-native';
import React, { useRef } from 'react';
import { View } from 'react-native';
import { Colors } from 'Style/Colors';

import { styles } from './ThemedDropdown.style';
import { ThemedDropdownComponentProps } from './ThemedDropdown.type';

export const ThemedDropdownComponent = ({
  inputStyle,
  inputLabel,
  data,
  value,
  header,
  asOverlay,
  overlayRef,
  onChange,
  style,
  onClose,
}: ThemedDropdownComponentProps) => {
  const componentOverlayRef = useRef<ThemedOverlayRef>(null);

  const renderModal = () => {
    return (
      <ThemedOverlay
        ref={ overlayRef || componentOverlayRef }
        containerStyle={ styles.overlay }
        contentContainerStyle={ styles.overlayContent }
        onClose={ onClose }
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
        onPress={ () => (overlayRef || componentOverlayRef).current?.open() }
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
