import { FilmViewScheduleItem } from 'Component/FilmViewScheduleItem';
import { Loader } from 'Component/Loader';
import { ThemedAccordion } from 'Component/ThemedAccordion';
import { ThemedBottomSheet } from 'Component/ThemedBottomSheet';
import { ThemedBottomSheetRef } from 'Component/ThemedBottomSheet/ThemedBottomSheet.type';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useCallback, useEffect, useState } from 'react';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';

import { componentStyles } from './FilmViewScheduleOverlay.style';
import { FilmViewScheduleOverlayComponentProps } from './FilmViewScheduleOverlay.type';

export function FilmViewScheduleOverlayComponent({
  ref,
  ...props
}: FilmViewScheduleOverlayComponentProps<ThemedBottomSheetRef>) {
  return (
    <ThemedBottomSheet
      ref={ ref }
      detents={ [0.4, 1] }
      scrollable
    >
      <ScheduleModalComponent
        { ...props }
      />
    </ThemedBottomSheet>
  );
}

const ScheduleModalComponent = ({
  film,
  handleUpdateScheduleWatch,
}: Omit<FilmViewScheduleOverlayComponentProps<ThemedBottomSheetRef>, 'ref'>) => {
  const styles = useThemedStyles(componentStyles);
  const { schedule = [] } = film;
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    // prevents lagging when rendering
    setTimeout(() => {
      setRendered(true);
    }, 50);
  }, []);

  const renderItem = useCallback((item: ScheduleItemInterface) => (
    <FilmViewScheduleItem
      key={ `modal-schedule-${item.name}` }
      item={ item }
      handleUpdateScheduleWatch={ handleUpdateScheduleWatch }
      useInternalState
    />
  ), [handleUpdateScheduleWatch]);

  const data = schedule.map(({ name, items }) => ({
    id: name,
    title: name,
    items,
  }));

  return (
    <Wrapper style={ styles.content }>
      { /* The scroll view stays mounted while the accordion is deferred: TrueSheet pins the
           scrollable to the sheet behavior when it presents, and only re-checks on direct
           children of its content view, so one that mounts later is never picked up. */ }
      <ThemedScrollView containerStyle={ styles.scrollView }>
        { rendered ? (
          <ThemedAccordion
            data={ data }
            renderItem={ renderItem }
          />
        ) : (
          <Loader isLoading style={ styles.loader } />
        ) }
      </ThemedScrollView>
    </Wrapper>
  );
};

export default FilmViewScheduleOverlayComponent;
