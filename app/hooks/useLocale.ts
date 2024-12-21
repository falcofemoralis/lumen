import { useEffect, useState } from 'react';
import { getConfig } from 'Util/Config';
import { CONFIG_KEY_ENUM } from 'Util/Config/mapping';
import i18n from 'Util/Translation/i18n';

export function useLocale() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getConfig(CONFIG_KEY_ENUM.language)
      .then((language: string) => {
        i18n.locale = language;
      })
      .catch(() => {
        //console.error('Error loading language');
      })
      .finally(() => {
        setLoaded(true);
      });
  }, []);

  return [loaded];
}
