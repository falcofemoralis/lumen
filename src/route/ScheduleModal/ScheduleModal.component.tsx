import ThemedText from 'Component/ThemedText';
import { useNavigation } from 'expo-router';
import t from 'i18n/t';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { styles } from 'Route/FilmPage/FilmPage.style';
import { ScheduleItem } from 'Route/FilmPage/FilmPageElements';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';

import { ScheduleModalProps } from './ScheduleModal.type';

export const ScheduleModalComponent = ({ film }: ScheduleModalProps) => {
  const navigation = useNavigation();
  const { schedule = [] } = film;

  useEffect(() => {
    navigation.setOptions({
      title: t('Schedule'),
    });
  }, [navigation]);

  const handleUpdateScheduleWatch = (item: ScheduleItemInterface) => {
    console.log('handleUpdateScheduleWatch', item);
  };

  return (
    <View>
      <ScrollView>
        { schedule.map(({ name, items }) => (
          <View key={ name }>
            <ThemedText style={ styles.scheduleSeason }>
              { name }
            </ThemedText>
            <View>
              { items.map((subItem, idx) => (
                <ScheduleItem
                  key={ `modal-${subItem.name}` }
                  item={ subItem }
                  handleUpdateScheduleWatch={ handleUpdateScheduleWatch }
                />
              )) }
            </View>
          </View>
        )) }
      </ScrollView>
    </View>
  );
};

export default ScheduleModalComponent;