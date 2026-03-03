import { ThemedButton } from 'Component/ThemedButton';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { Plus } from 'lucide-react-native';
import { useRef } from 'react';
import { TextInput, View } from 'react-native';
import NotificationStore from 'Store/Notification.store';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { componentStyles } from './ThemedCustomSelect.style';
import { ThemedCustomSelectComponentProps } from './ThemedCustomSelect.type';

const CustomSelectModalComponent = ({
  value,
  options,
  styles,
  onSelect,
}: ThemedCustomSelectComponentProps & { styles: ThemedStyles<typeof componentStyles> }) => {
  const valueRef = useRef(value);
  const textRef = useRef<TextInput>(null);
  const dropdownRef = useRef<ThemedOverlayRef>(null);

  const handleSelect = () => {
    if (!valueRef.current) {
      NotificationStore.displayError(t('Please select or type a value'));

      return;
    }

    onSelect(valueRef.current);
  };

  const handleDropdownChange = (item: { value: string }) => {
    valueRef.current = item.value;
    textRef.current?.setNativeProps({ text: item.value });
    dropdownRef.current?.close();
  };

  return (
    <View style={ styles.modalView }>
      <ThemedInput
        ref={ textRef }
        placeholder={ t('Type or select value') }
        defaultValue={ value }
        onChangeText={ (text) => (valueRef.current = text) }
      />
      <ThemedDropdown
        onChange={ handleDropdownChange }
        data={ options.map((item) => ({ label: item, value: item })) }
        overlayRef={ dropdownRef }
        inputLabel={ t('Select from presets') }
      />
      <ThemedButton onPress={ handleSelect }>
        { t('Confirm') }
      </ThemedButton>
    </View>
  );
};

export const ThemedCustomSelectComponent = (props: ThemedCustomSelectComponentProps) => {
  const {
    asOverlay,
    value,
    overlayRef,
    style,
    inputStyle,
    disabled,
    onSelect,
    onClose,
  } = props;
  const { theme, scale } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const componentOverlayRef = useRef<ThemedOverlayRef>(null);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    (overlayRef || componentOverlayRef).current?.close();
  };

  const renderModal = () => {
    return (
      <ThemedOverlay
        ref={ overlayRef || componentOverlayRef }
        containerStyle={ styles.overlay }
        contentContainerStyle={ styles.overlayContent }
        onClose={ onClose }
        useKeyboardAdjustment
      >
        <CustomSelectModalComponent
          { ...props }
          onSelect={ handleSelect }
          styles={ styles }
        />
      </ThemedOverlay>
    );
  };

  const renderInput = () => {
    if (asOverlay) {
      return null;
    }

    return (
      <ThemedButton
        style={ [styles.input, inputStyle] }
        contentStyle={ styles.inputContent }
        onPress={ () => (overlayRef || componentOverlayRef).current?.open() }
        IconComponent={ Plus }
        iconProps={ {
          color: theme.colors.icon,
          size: scale(18),
        } }
        disabled={ disabled }
      >
        { value }
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

export default ThemedCustomSelectComponent;
