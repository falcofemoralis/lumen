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

import { componentStyles } from './FilmViewScheduleItem.style.atv';
import { FilmViewScheduleItemComponentProps } from './FilmViewScheduleItem.type';

export function FilmViewScheduleItemComponent({
  item,
  handleUpdateScheduleWatch,
  style,
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

    setIsChecked((prev) => !prev);
  }, [handleUpdateScheduleWatch, item]);

  return (
    <ThemedPressable
      onPress={ handlePress }
    >
      { ({ isFocused }) => (
        <View
          style={ [
            styles.scheduleItem,
            style,
            isFocused && styles.scheduleItemFocused,
          ] }
        >
          <View style={ styles.scheduleItemInfoWrapper }>
            <View style={ styles.scheduleItemEpisodeWrapper }>
              <ThemedText style={ [
                styles.scheduleItemText,
                styles.scheduleItemEpisodeName,
                isFocused && styles.scheduleItemTextFocused,
              ] }
              >
                { episodeName }
              </ThemedText>
              <ThemedText style={ [
                styles.scheduleItemText,
                styles.scheduleItemEpisodeOgName,
                isFocused && styles.scheduleItemTextFocused,
              ] }
              >
                { episodeNameOriginal }
              </ThemedText>
            </View>
            <View style={ styles.scheduleItemNameWrapper }>
              <ThemedText style={ [
                styles.scheduleItemText,
                isFocused && styles.scheduleItemTextFocused,
              ] }
              >
                { name }
              </ThemedText>
              <ThemedText style={ [
                styles.scheduleItemText,
                isFocused && styles.scheduleItemTextFocused,
              ] }
              >
                { date }
              </ThemedText>
            </View>
          </View>
          <View style={ styles.scheduleItemReleaseWrapper }>
            { isReleased ? (
              <View
                style={ styles.scheduleItemMarkIcon }
              >
                { isLoading ? (
                  <Loader isLoading />
                ) : (
                  <CircleCheck
                    size={ scale(24) }
                    color={ isChecked
                      ? theme.colors.secondary
                      : isFocused
                        ? theme.colors.iconFocused
                        : theme.colors.icon }
                  />
                ) }
              </View>
            ) : (
              <ThemedText
                style={ [
                  styles.scheduleItemText,
                  styles.scheduleItemReleaseDate,
                  isFocused && styles.scheduleItemTextFocused,
                ] }
              >
                { releaseDate }
              </ThemedText>
            ) }
          </View>
        </View>
      ) }
    </ThemedPressable>
  );
}

export default memo(
  FilmViewScheduleItemComponent,
  (prevProps, nextProps) => prevProps.item.name === nextProps.item.name
);
