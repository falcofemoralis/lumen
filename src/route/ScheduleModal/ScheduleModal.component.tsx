import Header from 'Component/Header';
import Loader from 'Component/Loader';
import ThemedAccordion from 'Component/ThemedAccordion';
import Wrapper from 'Component/Wrapper';
import t from 'i18n/t';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ScheduleItem } from 'Route/FilmPage/FilmPageElements';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';

import { styles } from './ScheduleModal.style';
import { ScheduleModalProps } from './ScheduleModal.type';

export const ScheduleModalComponent = ({ film, handleUpdateScheduleWatch }: ScheduleModalProps) => {
  const { schedule = [] } = film;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // prevents lagging when rendering large schedule
    setTimeout(() => {
      setIsLoading(false);
    }, 0);
  }, [schedule]);

  const renderItem = useCallback((item: ScheduleItemInterface, idx: number) => (
    <ScheduleItem
      key={ `modal-schedule-${item.name}` }
      item={ item }
      handleUpdateScheduleWatch={ handleUpdateScheduleWatch }
    />
  ), [handleUpdateScheduleWatch]);

  const data = schedule.map(({ name, items }) => ({
    id: name,
    title: name,
    items,
  }));

  if (isLoading) {
    return <Loader isLoading fullScreen />;
  }

  return (
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
  );
};

export default ScheduleModalComponent;