import { Loader } from 'Component/Loader';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import {
  memo,
  useCallback,
  useState,
} from 'react';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './FilmViewScheduleItem.style';
import { FilmViewScheduleItemComponentProps } from './FilmViewScheduleItem.type';

export function FilmViewScheduleItemComponent({
  item,
  useInternalState,
  handleUpdateScheduleWatch,
}: FilmViewScheduleItemComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const {
    name,
    episodeName,
    episodeNameOriginal,
    date,
    releaseDate,
    isWatched,
    isReleased,
  } = item;
  const { scale, theme } = useAppTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(isWatched);
  const [syncedIsWatched, setSyncedIsWatched] = useState(isWatched);

  // the prop is the source of truth, `isChecked` only holds the optimistic press state,
  // so re-sync during render whenever the item comes back with a new watched flag
  if (syncedIsWatched !== isWatched) {
    setSyncedIsWatched(isWatched);
    setIsChecked(isWatched);
  }

  const handlePress = useCallback(async () => {
    setIsLoading(true);

    const result = await handleUpdateScheduleWatch(item);

    setIsLoading(false);

    if (!result) {
      return;
    }

    if (useInternalState) {
      setIsChecked((prev) => !prev);
    }
  }, [handleUpdateScheduleWatch, item]);

  return (
    <View style={ styles.scheduleItem }>
      <View style={ styles.scheduleItemInfoWrapper }>
        <View style={ styles.scheduleItemEpisodeWrapper }>
          <ThemedText style={ [
            styles.scheduleItemText,
            styles.scheduleItemEpisodeName,
          ] }
          >
            { episodeName }
          </ThemedText>
          <ThemedText style={ [
            styles.scheduleItemText,
            styles.scheduleItemEpisodeOgName,
          ] }
          >
            { episodeNameOriginal }
          </ThemedText>
        </View>
        <View style={ styles.scheduleItemNameWrapper }>
          <ThemedText style={ styles.scheduleItemText }>
            { name }
          </ThemedText>
          <ThemedText style={ styles.scheduleItemText }>
            { date }
          </ThemedText>
        </View>
      </View>
      <View style={ styles.scheduleItemReleaseWrapper }>
        { isReleased ? (
          <ThemedPressable
            style={ styles.scheduleItemMarkIcon }
            onPress={ handlePress }
          >
            { isLoading ? (
              <Loader isLoading />
            ) : (
              <CircleCheck
                size={ scale(24) }
                color={ (useInternalState ? isChecked : isWatched) ? theme.colors.secondary : theme.colors.icon }
              />
            ) }
          </ThemedPressable>
        ) : (
          <ThemedText
            style={ [
              styles.scheduleItemText,
              styles.scheduleItemReleaseDate,
            ] }
          >
            { releaseDate }
          </ThemedText>
        ) }
      </View>
    </View>
  );
}

export default memo(
  FilmViewScheduleItemComponent,
  (prevProps, nextProps) => prevProps.item.id === nextProps.item.id
    && prevProps.item.isWatched === nextProps.item.isWatched
);
