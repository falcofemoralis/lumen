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

import { BaseSlide, BaseSlideProps } from './BaseSlide';

export const ProviderSlide = ({
  goNext,
  styles,
  ...props
}: BaseSlideProps) => {
  const { theme } = useAppTheme();
  const { currentService, updateProvider, updateOfficialMode, logout, validateUrl } = useServiceContext();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(currentService.getDefaultProvider());
  const [isOfficialMode, setIsOfficialMode] = useState<boolean>(currentService.isOfficialMode());

  // the mutation status is the validation result: idle -> not checked yet, error -> invalid
  const {
    mutate: validateProvider,
    isPending: isLoading,
    isSuccess: isProviderValid,
    isError: isProviderInvalid,
    reset: resetValidation,
  } = useMutation({
    mutationFn: async () => {
      logout(true);

      await validateUrl(currentService.getProvider());
    },
    onError: (error) => {
      console.error(error);
      NotificationStore.displayError(t('Invalid provider'));
    },
    // the slide reports the failure itself with a provider specific message
    meta: { silent: true },
  });

  const handleValidateProvider = useCallback(() => {
    validateProvider();
  }, [validateProvider]);

  const handleUpdateProvide = useCallback((value: string) => {
    if (!value) {
      NotificationStore.displayError(t('Please select a provider'));

      return;
    }

    updateProvider(value);
    setSelectedProvider(value);
    resetValidation();
  }, [updateProvider, resetValidation]);

  const handleOfficialMode = useCallback((value: boolean) => {
    updateOfficialMode(value);
    setIsOfficialMode(value);
    resetValidation();
  }, [updateOfficialMode, resetValidation]);

  const handleNext = useCallback(() => {
    logout(true);
    goNext?.();
  }, [logout, goNext]);

  return (
    <BaseSlide
      { ...props }
      goNext={ handleNext }
      styles={ styles }
    >
      <View style={ styles.providerWrapper }>
        <ThemedCustomSelect
          options={ currentService.defaultProviders }
          value={ selectedProvider ?? '' }
          onSelect={ handleUpdateProvide }
          disabled={ isOfficialMode }
        />
        <View style={ styles.providerOffModeRow }>
          <ThemedText>
            { t('Official mode') }
          </ThemedText>
          <ThemedToggle
            value={ isOfficialMode }
            onValueChange={ handleOfficialMode }
          />
        </View>
        <ThemedPressable
          style={ styles.providerValidateButton }
          contentStyle={ [
            styles.providerValidateButtonContent,
            isLoading && styles.providerValidateButtonDisabled,
          ] }
          onPress={ handleValidateProvider }
          disabled={ isLoading }
        >
          { ({ isFocused }) => (
            <View style={ [
              styles.providerValidateButtonInner,
              isFocused && styles.TVfocused,
            ] }
            >
              { !isProviderValid && !isProviderInvalid && (
                <RefreshCw color={ isFocused ? theme.colors.iconFocused : theme.colors.icon } />
              ) }
              { isProviderInvalid && (
                <CircleAlert color='red' />
              ) }
              { isProviderValid && (
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
