import Loader from 'Component/Loader';
import ThemedAccordion from 'Component/ThemedAccordion';
import Wrapper from 'Component/Wrapper';
import { useNavigation } from 'expo-router';
import t from 'i18n/t';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { ScheduleItem } from 'Route/FilmPage/FilmPageElements';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';

import { ScheduleModalProps } from './ScheduleModal.type';

export const ScheduleModalComponent = ({ film, handleUpdateScheduleWatch }: ScheduleModalProps) => {
  const navigation = useNavigation();
  const { schedule = [] } = film;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: t('Schedule'),
    });

    // prevents lagging when rendering large schedule
    setTimeout(() => {
      setIsLoading(false);
    }, 0);
  }, [schedule, navigation]);

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
    <Wrapper>
      <ScrollView>
        <ThemedAccordion
          data={ data }
          renderItem={ renderItem }
        />
      </ScrollView>
    </Wrapper>
  );
};

export default ScheduleModalComponent;