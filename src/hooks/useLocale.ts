import { useState } from 'react';

export function useLocale() {
  const [loaded, setLoaded] = useState(true);

  // useEffect(() => {
  //   getConfig('deviceLanguage')
  //     .then((language: string | null) => {
  //       i18n.locale = language ?? 'en';
  //     })
  //     .catch(() => {
  //       // console.error('Error loading language');
  //     })
  //     .finally(() => {
  //       setLoaded(true);
  //     });
  // }, []);

  return [loaded];
}
