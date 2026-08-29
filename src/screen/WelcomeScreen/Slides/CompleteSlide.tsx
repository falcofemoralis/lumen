import { useConfigContext } from 'Context/ConfigContext';
import { t } from 'i18n/translate';
import { useCallback } from 'react';
import NotificationStore from 'Store/Notification.store';
import { restartApp } from 'Util/Device';

import { BaseSlide, BaseSlideProps } from './BaseSlide';

export const CompleteSlide = ({
  ...props
}: BaseSlideProps) => {
  const { setConfig } = useConfigContext();

  const handleComplete = useCallback(() => {
    NotificationStore.displayMessage(t('Welcome to the app!'));

    setConfig('isConfigured', true);

    restartApp();
  }, [setConfig]);

  return (
    <BaseSlide
      { ...props }
      nextButtonTitle={ t('Complete') }
      goNext={ handleComplete }
    />
  );
};