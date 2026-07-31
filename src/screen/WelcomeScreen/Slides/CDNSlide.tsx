import { useMutation } from '@tanstack/react-query';
import { ThemedCustomSelect } from 'Component/ThemedCustomSelect';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { ThemedToggle } from 'Component/ThemedToggle';
import { useServiceContext } from 'Context/ServiceContext';
import { t } from 'i18n/translate';
import { Check, CircleAlert, RefreshCw } from 'lucide-react-native';
import {
  useCallback,
  useState,
} from 'react';
import {
  View,
} from 'react-native';
import NotificationStore from 'Store/Notification.store';
import { useAppTheme } from 'Theme/context';
import { FilmInterface } from 'Type/Film.interface';

import { TEST_URL } from '../WelcomeScreen.config';
import { BaseSlide, BaseSlideProps } from './BaseSlide';

export const CDNSlide = ({
  styles,
  ...props
}: BaseSlideProps) => {
  const { theme } = useAppTheme();
  const { currentService, validateUrl, updateAutomaticCDN, updateCDN } = useServiceContext();
  const [selectedCDN, setSelectedCDN] = useState<string | null>(currentService.getCDN());
  const [isAutomatic, setIsAutomatic] = useState<boolean>(currentService.isAutomaticCDN());

  // the mutation status is the validation result: idle -> not checked yet, error -> invalid
  const {
    mutate: validateCDN,
    isPending: isLoading,
    isSuccess: isCDNValid,
    isError: isCDNInvalid,
    reset: resetValidation,
  } = useMutation({
    mutationFn: async () => {
      let film: FilmInterface | null = null;

      try {
        film = await currentService.getFilm(TEST_URL);
      } catch (error) {
        console.error(error);

        throw new Error(t('Invalid CDN'));
      }

      const { voices } = film ?? {};

      if (!voices?.length
        || !voices[0].video
        || !voices[0].video.streams.length
      ) {
        throw new Error(t('Something went wrong'));
      }

      const { url } = currentService.modifyCDN(voices[0].video.streams)[0];

      await validateUrl((new URL(url)).origin);
    },
  });

  const handleUpdateCDN = useCallback((value?: string | null) => {
    if (!value) {
      NotificationStore.displayError(t('Please select a CDN'));

      return;
    }

    setSelectedCDN(value);
    updateCDN(value ?? '');
    resetValidation();
  }, [updateCDN, resetValidation]);

  const handleAutomaticMode = useCallback((value: boolean) => {
    setIsAutomatic(value);
    updateAutomaticCDN(value);
    resetValidation();
  }, [updateAutomaticCDN, resetValidation]);

  const handleValidateCDN = useCallback(() => {
    validateCDN();
  }, [validateCDN]);

  return (
    <BaseSlide
      { ...props }
      styles={ styles }
    >
      <View style={ styles.cdnWrapper }>
        <ThemedCustomSelect
          options={ currentService.defaultCDNs }
          value={ selectedCDN ?? '' }
          onSelect={ handleUpdateCDN }
          disabled={ isAutomatic }
        />
        <View style={ styles.providerOffModeRow }>
          <ThemedText>
            { t('Automatic') }
          </ThemedText>
          <ThemedToggle
            value={ isAutomatic }
            onValueChange={ handleAutomaticMode }
          />
        </View>
        <ThemedPressable
          style={ styles.providerValidateButton }
          contentStyle={ [
            styles.providerValidateButtonContent,
            isLoading && styles.providerValidateButtonDisabled,
          ] }
          onPress={ handleValidateCDN }
          disabled={ isLoading }
        >
          { ({ isFocused }) => (
            <View style={ [
              styles.providerValidateButtonInner,
              isFocused && styles.TVfocused,
            ] }
            >
              { !isCDNValid && !isCDNInvalid && (
                <RefreshCw color={ isFocused ? theme.colors.iconFocused : theme.colors.icon } />
              ) }
              { isCDNInvalid && (
                <CircleAlert color='red' />
              ) }
              { isCDNValid && (
                <Check color='green' />
              ) }
              <ThemedText
                style={ [
                  styles.providerButtonText,
                  isFocused && styles.TVfocusedText,
                ] }
              >
                { t('Validate') }
              </ThemedText>
            </View>
          ) }
        </ThemedPressable>
      </View>
    </BaseSlide>
  );
};