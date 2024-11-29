import { useState } from 'react';
import { getConfig } from 'Util/Config';
import { CONFIG_KEY_ENUM } from 'Util/Config/mapping';
import i18n from 'Util/Translation/i18n';

export function useLocale() {
  const [loaded, setLoaded] = useState(false);

  getConfig(CONFIG_KEY_ENUM.language)
    .then((language: string) => {
      i18n.locale = language;
      setLoaded(true);
    })
    .catch(() => {
      setLoaded(true);
    });

  return [loaded];
}
