import { AccordionGroupInterface } from 'Component/ThemedAccordion/ThemedAccordion.type';
import { useConfigContext } from 'Context/ConfigContext';
import { t } from 'i18n/translate';
import { useMemo } from 'react';
import { InfoListInterface } from 'Type/InfoList.interface';

import FilmViewInfoListOverlayComponent from './FilmViewInfoListOverlay.component';
import FilmViewInfoListOverlayComponentTV from './FilmViewInfoListOverlay.component.atv';
import { FilmViewInfoListOverlayContainerProps } from './FilmViewInfoListOverlay.type';

export function FilmViewInfoListOverlayContainer({
  film,
  handleSelectCategory,
}: FilmViewInfoListOverlayContainerProps) {
  const { isTV } = useConfigContext();

  const data = useMemo<AccordionGroupInterface<InfoListInterface>[]>(() => {
    const { includedIn = [], fromCollections = [] } = film;

    const items = [];

    if (includedIn.length) {
      items.push({
        id: 'included-in',
        title: t('Included in the lists'),
        items: includedIn,
      });
    }

    if (fromCollections.length) {
      items.push({
        id: 'from-collections',
        title: t('From collections'),
        items: fromCollections,
      });
    }

    return items;
  }, [film]);

  const containerProps = {
    data,
    handleSelectCategory,
  };

  return isTV
    ? <FilmViewInfoListOverlayComponentTV { ...containerProps } />
    : <FilmViewInfoListOverlayComponent { ...containerProps } />;
}

export default FilmViewInfoListOverlayContainer;
