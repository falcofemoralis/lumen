import Header from 'Component/Header';
import Loader from 'Component/Loader';
import ThemedAccordion from 'Component/ThemedAccordion';
import ThemedSafeArea from 'Component/ThemedSafeArea';
import Wrapper from 'Component/Wrapper';
import t from 'i18n/t';
import { SCHEDULE_MODAL_ROUTE } from 'Navigation/routes';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ScheduleItem } from 'Route/FilmPage/FilmPageElements';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';

import { styles } from './ScheduleModal.style';
import { ScheduleModalProps } from './ScheduleModal.type';

export const ScheduleModal = () => {
  const { film, handleUpdateScheduleWatch } = RouterStore.popData(SCHEDULE_MODAL_ROUTE) as {
    film: FilmInterface;
    handleUpdateScheduleWatch: (scheduleItem: ScheduleItemInterface) => Promise<boolean>;
  } ?? {};

  return (
    <ScheduleModalComponent
      film={ film }
      handleUpdateScheduleWatch={ handleUpdateScheduleWatch }
    />
  );
};

export const ScheduleModalComponent = ({ film, handleUpdateScheduleWatch }: ScheduleModalProps) => {
  const { schedule = [] } = film;
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    // prevents lagging when rendering
    setTimeout(() => {
      setRendered(true);
    }, 50);
  }, []);

  const renderItem = useCallback((item: ScheduleItemInterface, idx: number) => (
    <ScheduleItem
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
    <ThemedSafeArea edges={ ['top', 'bottom', 'left', 'right'] }>
      <View style={ styles.container }>
        <Header title={ t('Schedule') } />
        <Wrapper style={ styles.wrapper }>
          <ScrollView>
            <ThemedAccordion
              data={ data }
              renderItem={ renderItem }
            />
          </ScrollView>
        </Wrapper>
      </View>
    </ThemedSafeArea>
  );
};

export default ScheduleModal;