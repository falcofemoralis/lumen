import { FilmViewScheduleItem } from 'Component/FilmViewScheduleItem';
import { Loader } from 'Component/Loader';
import { ThemedAccordion } from 'Component/ThemedAccordion';
import { ThemedBottomSheet } from 'Component/ThemedBottomSheet';
import { ThemedBottomSheetRef } from 'Component/ThemedBottomSheet/ThemedBottomSheet.type';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { Wrapper } from 'Component/Wrapper';
import { useCallback, useEffect, useState } from 'react';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';

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

  if (!rendered) {
    return <Loader isLoading fullScreen />;
  }

  return (
    <Wrapper style={ { flex: 1 } }>
      <ThemedScrollView>
        <ThemedAccordion
          data={ data }
          renderItem={ renderItem }
        />
      </ThemedScrollView>
    </Wrapper>
  );
};

export default FilmViewScheduleOverlayComponent;
