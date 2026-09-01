import { ThemedButton } from 'Component/ThemedButton';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Plus from 'lucide-react-native/icons/plus';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import NotificationStore from 'Store/Notification.store';
import { ThemedStyles } from 'Theme/types';

import { componentStyles } from './ThemedCustomSelect.style.atv';
import { ThemedCustomSelectComponentProps } from './ThemedCustomSelect.type';

const CustomSelectModalComponent = ({
  value,
  options,
  styles,
  onSelect,
}: ThemedCustomSelectComponentProps & { styles: ThemedStyles<typeof componentStyles> }) => {
  // Controlled on purpose: an uncontrolled input keeps the native `text` prop
  // frozen at the initial value, and the focus style flips the text `color`,
  // which makes Fabric rebuild the attributed string from that stale prop and
  // wipe whatever was typed the moment focus leaves the field.
  const [text, setText] = useState(value);
  const dropdownRef = useRef<ThemedOverlayRef>(null);

  const handleSelect = () => {
    if (!text) {
      NotificationStore.displayError(t('Please select or type a value'));

      return;
    }

    onSelect(text);
  };

  const handleDropdownChange = (item: { value: string }) => {
    setText(item.value);
    dropdownRef.current?.close();
  };

  return (
    <View style={ styles.modalView }>
      <ThemedInput
        placeholder={ t('Type or select value') }
        value={ text }
        onChangeText={ setText }
      />
      <ThemedDropdown
        onChange={ handleDropdownChange }
        data={ options.map((item) => ({ label: item, value: item })) }
        overlayRef={ dropdownRef }
        inputLabel={ t('Select from presets') }
      />
      <ThemedButton
        title={ t('Confirm') }
        autofocus
        onPress={ handleSelect }
        contentStyle={ { flex: 1 } }
      />
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
        title={ value }
        style={ [styles.input, inputStyle] }
        contentStyle={ styles.inputContent }
        onPress={ () => {
          if (disabled) {
            return;
          }

          (overlayRef || componentOverlayRef).current?.open();
        } }
        IconComponent={ Plus }
        disabled={ disabled }
      />
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
