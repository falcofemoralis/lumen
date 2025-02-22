import { useEffect, useState } from 'react';
import { getConfig } from 'Util/Config';
import { ConfigKeyType } from 'Util/Config/mapping';
import i18n from 'Util/Translation/i18n';

export function useLocale() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getConfig(ConfigKeyType.LANGUAGE)
      .then((language: string) => {
        i18n.locale = language;
      })
      .catch(() => {
        // console.error('Error loading language');
      })
      .finally(() => {
        setLoaded(true);
      });
  }, []);

  return [loaded];
}
