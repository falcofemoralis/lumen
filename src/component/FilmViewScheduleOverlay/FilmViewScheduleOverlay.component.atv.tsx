import { FilmViewScheduleItem } from 'Component/FilmViewScheduleItem';
import { ThemedAccordion } from 'Component/ThemedAccordion';
import { AccordionGroupInterface } from 'Component/ThemedAccordion/ThemedAccordion.type';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useMemo } from 'react';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';

import { componentStyles } from './FilmViewScheduleOverlay.style.atv';
import { FilmViewScheduleOverlayComponentProps } from './FilmViewScheduleOverlay.type';

export function FilmViewScheduleOverlayComponent({
  ref,
  film,
  handleUpdateScheduleWatch,
}: FilmViewScheduleOverlayComponentProps<ThemedOverlayRef>) {
  const styles = useThemedStyles(componentStyles);

  // Derived, NOT filled in on `onOpen`: the overlay claims focus the moment it
  // mounts, and `onOpen` only fires 250ms later, so building the groups there
  // left the very first open with an empty accordion, with nothing to focus.
  const items = useMemo<AccordionGroupInterface<ScheduleItemInterface>[]>(() => {
    const { schedule = [] } = film;

    return schedule.map(({ name, items: scheduleItems }) => ({
      id: name,
      title: name,
      items: scheduleItems,
    }));
  }, [film]);

  return (
    <ThemedOverlay
      ref={ ref }
      containerStyle={ styles.scheduleOverlay }
      contentContainerStyle={ styles.scheduleOverlayContent }
    >
      <ThemedAccordion
        data={ items }
        overlayContentStyle={ styles.scheduleAccordionOverlay }
        renderItem={ (subItem) => (
          <FilmViewScheduleItem
            key={ `modal-${subItem.name}` }
            item={ subItem }
            handleUpdateScheduleWatch={ handleUpdateScheduleWatch }
          />
        ) }
      />
    </ThemedOverlay>
  );
}

export default FilmViewScheduleOverlayComponent;
