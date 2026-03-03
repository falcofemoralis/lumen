import { ThemedButton } from 'Component/ThemedButton';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedSimpleList } from 'Component/ThemedSimpleList';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { Plus } from 'lucide-react-native';
import { memo, useRef } from 'react';
import { View } from 'react-native';

import { componentStyles } from './ThemedDropdown.style.atv';
import { ThemedDropdownComponentProps } from './ThemedDropdown.type';

export const ThemedDropdownComponent = ({
  inputStyle,
  data,
  value,
  header,
  asOverlay,
  style,
  inputLabel,
  onChange,
  overlayRef,
  onClose,
}: ThemedDropdownComponentProps) => {
  const styles = useThemedStyles(componentStyles);
  const componentOverlayRef = useRef<ThemedOverlayRef>(null);

  const renderModal = () => {
    return (
      <ThemedOverlay
        ref={ overlayRef || componentOverlayRef }
        containerStyle={ styles.container }
        contentContainerStyle={ styles.contentContainer }
        onClose={ onClose }
      >
        <ThemedSimpleList
          data={ data ?? [] }
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
        onPress={ () => (overlayRef || componentOverlayRef).current?.open() }
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

export default memo(ThemedDropdownComponent);
