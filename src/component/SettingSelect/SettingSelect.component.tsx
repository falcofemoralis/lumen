import Loader from 'Component/Loader';
import SettingBase from 'Component/SettingBase';
import { propsAreEqual } from 'Component/SettingBase/SettingBase.component';
import ThemedDropdown from 'Component/ThemedDropdown';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { memo, useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

import { SettingSelectComponentProps } from './SettingSelect.type';

export const SettingSelectComponent = memo(({
  setting,
  onUpdate,
}: SettingSelectComponentProps) => {
  const {
    id,
    title,
    options,
    value,
  } = setting;
  const overlayRef = useRef<ThemedOverlayRef>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onChange = useCallback(async (option: DropdownItem) => {
    setIsLoading(true);

    const success = await onUpdate(setting, option.value);

    if (success) {
      overlayRef.current?.close();
    }

    setIsLoading(false);
  }, [id, onUpdate]);

  return (
    <View>
      <SettingBase
        setting={ setting }
        onPress={ () => overlayRef.current?.open() }
      />
      <ThemedDropdown
        asOverlay
        overlayRef={ overlayRef }
        value={ value ?? '' }
        data={ options ?? [] }
        onChange={ onChange }
        header={ title }
      />
      <Loader
        isLoading={ isLoading }
        fullScreen
      />
    </View>
  );
}, propsAreEqual);

export default SettingSelectComponent;