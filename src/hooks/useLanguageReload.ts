import { NavigationState } from '@react-navigation/native';
import { getCurrentLanguage, Language } from 'i18n/index';
import i18n from 'i18next';
import { useEffect, useState } from 'react';
import { navigationRef } from 'Util/Navigation';

interface LanguageReload {
  language: Language;
  navigationState?: NavigationState;
}

/**
 * Re-renders the whole app in the newly picked language.
 *
 * Strings are read through the plain `t()` helper rather than react-i18next's hook, so
 * nothing in the tree is subscribed to i18next: on its own a language change updates the
 * locale and leaves every already rendered label untouched. Remounting the navigator under
 * a new key re-runs every `t()` in one go, including the ones a `useMemo` had snapshotted,
 * which is what the app used to restart itself for.
 *
 * The navigation state is carried across the remount, so the user stays on the screen they
 * switched the language from instead of being dropped back on the first tab. It is read in
 * the handler rather than on unmount, while the container the ref points at is still the
 * mounted one.
 */
export const useLanguageReload = (): LanguageReload => {
  const [reload, setReload] = useState<LanguageReload>(() => ({
    language: getCurrentLanguage(),
  }));

  useEffect(() => {
    const onLanguageChanged = () => {
      setReload({
        language: getCurrentLanguage(),
        navigationState: navigationRef.isReady() ? navigationRef.getRootState() : undefined,
      });
    };

    i18n.on('languageChanged', onLanguageChanged);

    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);

  return reload;
};
