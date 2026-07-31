import { FilmViewInfoList } from 'Component/FilmViewInfoList';
import { ThemedAccordion } from 'Component/ThemedAccordion';
import { useThemedStyles } from 'Hooks/useThemedStyles';

import { componentStyles } from './FilmViewInfoListOverlay.style.atv';
import { FilmViewInfoListOverlayComponentProps } from './FilmViewInfoListOverlay.type';

export function FilmViewInfoListOverlayComponent({
  data,
  handleSelectCategory,
}: FilmViewInfoListOverlayComponentProps) {
  const styles = useThemedStyles(componentStyles);

  return (
    <ThemedAccordion
      data={ data }
      overlayContentStyle={ styles.infoListAccordionOverlay }
      renderItem={ (subItem) => (
        <FilmViewInfoList
          key={ `info-list-${subItem.name}` }
          list={ subItem }
          handleSelectCategory={ handleSelectCategory }
        />
      ) }
    />
  );
}

export default FilmViewInfoListOverlayComponent;
