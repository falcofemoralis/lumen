import Loader from 'Component/Loader';
import ThemedButton from 'Component/ThemedButton';
import ThemedDropdown from 'Component/ThemedDropdown';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import ThemedInput from 'Component/ThemedInput';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedText from 'Component/ThemedText';
import { useOverlayContext } from 'Context/OverlayContext';
import t from 'i18n/t';
import {
  memo, useCallback,
  useId,
  useState,
} from 'react';
import { View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import Colors from 'Style/Colors';
import { noopFn } from 'Util/Function';

import { styles } from './SettingsPage.style';
import { SettingItem } from './SettingsPage.type';

type BaseComponentProps = {
  setting: SettingItem;
  onPress?: () => void;
};

type SettingProps = {
  setting: SettingItem;
  onUpdate: (id: string, value: string) => Promise<boolean>;
};

const BaseComponent = ({
  setting,
  onPress,
}: BaseComponentProps) => {
  const { title, subtitle } = setting;

  return (
    <TouchableRipple
      style={ styles.setting }
      onPress={ onPress ?? noopFn }
      rippleColor={ Colors.white }
    >
      <View style={ styles.settingContainer }>
        <ThemedText style={ styles.settingTitle }>
          { title }
        </ThemedText>
        <ThemedText style={ styles.settingSubtitle }>
          { subtitle }
        </ThemedText>
      </View>
    </TouchableRipple>
  );
};

export const SettingText = memo(({
  setting,
}: SettingProps) => <BaseComponent setting={ setting } />, (
  prevProps: SettingProps, nextProps: SettingProps,
) => prevProps.setting.id === nextProps.setting.id);

export const SettingSelect = memo(({
  setting,
  onUpdate,
}: SettingProps) => {
  const {
    id,
    title,
    options,
    value,
  } = setting;
  const overlayId = useId();
  const { openOverlay, closeOverlay } = useOverlayContext();
  const [isLoading, setIsLoading] = useState(false);

  const onChange = useCallback(async (option: DropdownItem) => {
    setIsLoading(true);

    const success = await onUpdate(id, option.value);

    if (success) {
      closeOverlay(overlayId);
    }

    setIsLoading(false);
  }, [overlayId, id, onUpdate]);

  return (
    <View>
      <BaseComponent
        setting={ setting }
        onPress={ () => openOverlay(overlayId) }
      />
      <ThemedDropdown
        asOverlay
        overlayId={ overlayId }
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
}, (
  prevProps: SettingProps, nextProps: SettingProps,
) => prevProps.setting.id === nextProps.setting.id
    && prevProps.setting.value === nextProps.setting.value);

export const SettingInput = memo(({
  setting,
  onUpdate,
}: SettingProps) => {
  const {
    title,
    value,
  } = setting;
  const overlayId = useId();
  const { openOverlay, closeOverlay } = useOverlayContext();
  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const onChangeText = useCallback((text: string) => {
    setInputValue(text);

    if (hasError) {
      setHasError(false);
    }
  }, [hasError]);

  const onSave = useCallback(async () => {
    if (!inputValue) {
      return;
    }

    if (inputValue === value) {
      closeOverlay(overlayId);

      return;
    }

    setIsLoading(true);

    const success = await onUpdate(setting.id, inputValue);

    if (success) {
      closeOverlay(overlayId);
    } else {
      setHasError(true);
    }

    setIsLoading(false);
  }, [onUpdate, setting.id, inputValue, overlayId]);

  return (
    <View>
      <BaseComponent
        setting={ setting }
        onPress={ () => openOverlay(overlayId) }
      />
      <ThemedOverlay
        id={ overlayId }
        onHide={ () => closeOverlay(overlayId) }
        contentContainerStyle={ styles.overlay }
      >
        <ThemedText style={ styles.overlayTitle }>
          { title }
        </ThemedText>
        <ThemedInput
          style={ styles.overlayInput }
          placeholder={ title }
          onChangeText={ onChangeText }
          value={ inputValue || '' }
          multiline
          disabled={ isLoading }
        />
        <ThemedButton
          style={ styles.overlayButton }
          onPress={ onSave }
          disabled={ !inputValue || isLoading || hasError }
        >
          { t('Save') }
        </ThemedButton>
        <Loader
          isLoading={ isLoading }
          fullScreen
        />
      </ThemedOverlay>
    </View>
  );
}, (
  prevProps: SettingProps, nextProps: SettingProps,
) => prevProps.setting.id === nextProps.setting.id
    && prevProps.setting.value === nextProps.setting.value);

export const SettingLink = memo(({
  setting,
  onUpdate,
}: SettingProps) => (
  <BaseComponent
    setting={ setting }
    onPress={ () => onUpdate(setting.id, '') }
  />
), (
  prevProps: SettingProps, nextProps: SettingProps,
) => prevProps.setting.id === nextProps.setting.id);
