import Loader from 'Component/Loader';
import ThemedButton from 'Component/ThemedButton';
import ThemedDropdown from 'Component/ThemedDropdown';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import ThemedInput from 'Component/ThemedInput';
import ThemedOverlay from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import {
  memo, useCallback,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';

import { styles } from './SettingsPage.style';
import { SettingItem } from './SettingsPage.type';

type BaseComponentProps = {
  setting: SettingItem;
  onPress?: () => void;
};

type SettingProps = {
  setting: SettingItem;
  onUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
};

const BaseComponent = ({
  setting,
  onPress,
}: BaseComponentProps) => {
  const { title, subtitle } = setting;

  return (
    <ThemedPressable
      style={ styles.setting }
      contentStyle={ styles.settingContent }
      onPress={ onPress }
    >
      <View style={ styles.settingContainer }>
        <ThemedText style={ styles.settingTitle }>
          { title }
        </ThemedText>
        <ThemedText style={ styles.settingSubtitle }>
          { subtitle }
        </ThemedText>
      </View>
    </ThemedPressable>
  );
};

export const SettingText = memo(({
  setting,
}: SettingProps) => <BaseComponent setting={ setting } />, (
  prevProps: SettingProps, nextProps: SettingProps
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
      <BaseComponent
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
}, (
  prevProps: SettingProps, nextProps: SettingProps
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
  const overlayRef = useRef<ThemedOverlayRef>(null);
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
      overlayRef.current?.close();

      return;
    }

    setIsLoading(true);

    const success = await onUpdate(setting, inputValue);

    if (success) {
      overlayRef.current?.close();
    } else {
      setHasError(true);
    }

    setIsLoading(false);
  }, [onUpdate, setting.id, inputValue]);

  return (
    <View>
      <BaseComponent
        setting={ setting }
        onPress={ () => overlayRef.current?.open() }
      />
      <ThemedOverlay
        ref={ overlayRef }
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
  prevProps: SettingProps, nextProps: SettingProps
) => prevProps.setting.id === nextProps.setting.id
    && prevProps.setting.value === nextProps.setting.value);

export const SettingLink = memo(({
  setting,
  onUpdate,
}: SettingProps) => (
  <BaseComponent
    setting={ setting }
    onPress={ () => onUpdate(setting, '') }
  />
), (
  prevProps: SettingProps, nextProps: SettingProps
) => prevProps.setting.id === nextProps.setting.id);
