import { Header } from 'Component/Header';
import { Loader } from 'Component/Loader';
import { ThemedAccordion } from 'Component/ThemedAccordion';
import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { SCHEDULE_MODAL_SCREEN } from 'Navigation/navigationRoutes';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { componentStyles } from 'Screen/FilmScreen/FilmScreen.style';
import { ScheduleItem } from 'Screen/FilmScreen/FilmScreenElements';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';

import { ScheduleModalProps } from './ScheduleModal.type';

export const ScheduleModal = () => {
  const { film, handleUpdateScheduleWatch } = RouterStore.popData(SCHEDULE_MODAL_SCREEN) as {
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
  const styles = useThemedStyles(componentStyles);

  useEffect(() => {
    // prevents lagging when rendering
    setTimeout(() => {
      setRendered(true);
    }, 50);
  }, []);

  const renderItem = useCallback((item: ScheduleItemInterface) => (
    <ScheduleItem
      key={ `modal-schedule-${item.name}` }
      item={ item }
      handleUpdateScheduleWatch={ handleUpdateScheduleWatch }
      useInternalState
      styles={ styles }
    />
  ), [handleUpdateScheduleWatch, styles]);

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
      <View style={ {
        flex: 1,
      } }
      >
        <Header title={ t('Schedule') } />
        <Wrapper style={ {
          flex: 1,
        } }
        >
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