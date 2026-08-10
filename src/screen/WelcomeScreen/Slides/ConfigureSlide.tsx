import { setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { t } from 'i18n/translate';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
} from 'react-native';
import NotificationStore from 'Store/Notification.store';
import { useAppTheme } from 'Theme/context';

import { SlidePressable } from '../Elements/SlidePressable';
import { CONFIGURE_MOBILE_FOCUS_KEY, CONFIGURE_TV_FOCUS_KEY } from '../WelcomeScreen.config';
import { DeviceType } from '../WelcomeScreen.type';
import { WelcomeScreenMobile, WelcomeScreenTV } from '../WelcomeScreenIcons';
import { BaseSlide, BaseSlideProps } from './BaseSlide';

export const ConfigureSlide = ({
  goNext,
  styles,
  ...props
}: BaseSlideProps) => {
  const { isTV, setConfig } = useConfigContext();
  const { theme } = useAppTheme();
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType | null>(null);
  const focusedTypeRef = useRef<DeviceType | null>(null);

  // Flipping `isTV` swaps the TV/mobile variants of the components the slide is
  // built from (ThemedGroup ...), so React remounts them -- including the
  // navigation buttons, whose "Next" claims the slide's default focus on mount.
  // Put focus back on the option the user just picked. Children commit before
  // parents, so this runs after that claim; `isTV` is a dependency as well
  // because the config write can land in a later render than the selection.
  useEffect(() => {
    if (!selectedDeviceType) {
      return;
    }

    if (focusedTypeRef.current) {
      setFocus(
        selectedDeviceType === DeviceType.TV ? CONFIGURE_TV_FOCUS_KEY : CONFIGURE_MOBILE_FOCUS_KEY
      );
    }
  }, [selectedDeviceType, isTV]);

  const handleNext = useCallback(() => {
    if (!selectedDeviceType) {
      NotificationStore.displayMessage(t('Please select a device type'));

      return;
    }

    goNext?.();
  }, [selectedDeviceType, goNext]);

  const configureDeviceType = useCallback((type: DeviceType) => {
    setSelectedDeviceType(type);
    setConfig('isTV', type === DeviceType.TV);
  }, [setConfig]);

  const focusDeviceType = useCallback((type: DeviceType) => {
    focusedTypeRef.current = type;
  }, []);

  return (
    <BaseSlide
      { ...props }
      goNext={ handleNext }
      styles={ styles }
    >
      <View style={ styles.configureWrapper }>
        <SlidePressable
          focusKey={ CONFIGURE_TV_FOCUS_KEY }
          style={ styles.configureButton }
          contentStyle={ [
            styles.configureButtonContent,
            selectedDeviceType === DeviceType.TV && styles.configureButtonSelected,
          ] }
          onPress={ () => configureDeviceType(DeviceType.TV) }
          onFocus={ () => focusDeviceType(DeviceType.TV) }
          styles={ styles }
        >
          { ({ isFocused }) => (
            <View style={ styles.configureContainer }>
              <View style={ styles.configureIcon }>
                <WelcomeScreenTV
                  color={ isFocused ? theme.colors.iconFocused : theme.colors.icon }
                />
              </View>
              <View style={ styles.configureInfo }>
                <ThemedText
                  style={ [
                    styles.configureTitle,
                    isFocused && styles.TVfocusedText,
                  ] }
                >
                  { t('TV Version') }
                </ThemedText>
                <ThemedText
                  style={ [
                    styles.configureSubtitle,
                    isFocused && styles.TVfocusedText,
                  ] }
                >
                  { t('Suits for TV') }
                </ThemedText>
              </View>
            </View>
          ) }
        </SlidePressable>
        <SlidePressable
          focusKey={ CONFIGURE_MOBILE_FOCUS_KEY }
          style={ styles.configureButton }
          contentStyle={ [
            styles.configureButtonContent,
            selectedDeviceType === DeviceType.MOBILE && styles.configureButtonSelected,
          ] }
          onPress={ () => configureDeviceType(DeviceType.MOBILE) }
          onFocus={ () => focusDeviceType(DeviceType.MOBILE) }
          styles={ styles }
        >
          { ({ isFocused }) => (
            <View style={ styles.configureContainer }>
              <View style={ styles.configureIcon }>
                <WelcomeScreenMobile
                  color={ isFocused ? theme.colors.iconFocused : theme.colors.icon }
                />
              </View>
              <View style={ styles.configureInfo }>
                <ThemedText
                  style={ [
                    styles.configureTitle,
                    isFocused && styles.TVfocusedText,
                  ] }
                >
                  { t('Mobile Version') }
                </ThemedText>
                <ThemedText
                  style={ [
                    styles.configureSubtitle,
                    isFocused && styles.TVfocusedText,
                  ] }
                >
                  { t('Suits for mobile') }
                </ThemedText>
              </View>
            </View>
          ) }
        </SlidePressable>
      </View>
    </BaseSlide>
  );
};