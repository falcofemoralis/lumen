import Loader from 'Component/Loader';
import ThemedButton from 'Component/ThemedButton';
import ThemedDropdown from 'Component/ThemedDropdown';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import ThemedInput from 'Component/ThemedInput';
import ThemedOverlay from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import {
  memo,
  useCallback,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';
import { DefaultFocus, SpatialNavigationFocusableView } from 'react-tv-space-navigation';

import { styles } from './SettingsPage.style.atv';
import { SettingItem } from './SettingsPage.type';

type BaseComponentProps = {
  setting: SettingItem;
  onPress?: () => void;
};

type SettingProps = {
  setting: SettingItem;
  onUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
};

function propsAreEqual(prevProps: BaseComponentProps, props: BaseComponentProps) {
  const {
    setting: {
      id,
      value,
      isEnabled,
      isHidden,
    },
  } = props;

  return prevProps.setting.id === id
    && prevProps.setting.value === value
    && prevProps.setting.isEnabled === isEnabled
    && prevProps.setting.isHidden === isHidden;
}

const BaseComponent = memo(({
  setting,
  onPress,
}: BaseComponentProps) => {
  const { title, subtitle, isHidden, isEnabled } = setting;

  if (isHidden) {
    return null;
  }

  return (
    <SpatialNavigationFocusableView
      onSelect={ () => isEnabled && onPress?.() }
    >
      { ({ isFocused, isRootActive }) => (
        <View style={ [
          styles.setting,
          isFocused && isRootActive && styles.settingFocused,
          !isEnabled && styles.settingHidden,
        ] }
        >
          <ThemedText style={ [
            styles.settingTitle,
            isFocused && isRootActive && styles.settingTitleFocused,
          ] }
          >
            { title }
          </ThemedText>
          <ThemedText style={ [
            styles.settingSubtitle,
            isFocused && isRootActive && styles.settingSubtitleFocused,
          ] }
          >
            { subtitle }
          </ThemedText>
        </View>
      ) }
    </SpatialNavigationFocusableView>
  );
}, propsAreEqual);

export const SettingText = ({
  setting,
  onUpdate,
}: SettingProps) => <BaseComponent setting={ setting } onPress={ () => onUpdate(setting, '') } />;

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
}, propsAreEqual);

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
        onClose={ () => setInputValue(value) }
      >
        <DefaultFocus>
          <ThemedText style={ styles.overlayTitle }>
            { title }
          </ThemedText>
          <ThemedInput
            style={ styles.overlayInput }
            placeholder={ title }
            onChangeText={ onChangeText }
            defaultValue={ value || '' }
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
        </DefaultFocus>
      </ThemedOverlay>
    </View>
  );
}, propsAreEqual);

export const SettingLink = memo(({
  setting,
  onUpdate,
}: SettingProps) => (
  <BaseComponent
    setting={ setting }
    onPress={ () => onUpdate(setting, '') }
  />
), propsAreEqual);
