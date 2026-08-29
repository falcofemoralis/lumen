import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Star from 'lucide-react-native/icons/star';
import { memo } from 'react';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './FilmViewActor.style.atv';
import { FilmViewActorComponentProps } from './FilmViewActor.type';

export function FilmViewActorComponent({
  actor,
  handleSelectActor,
}: FilmViewActorComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const {
    name,
    photo,
    job,
    isDirector,
    link,
  } = actor;
  const { scale } = useAppTheme();

  return (
    <ThemedPressable
      onPress={ () => handleSelectActor(link ?? '') }
    >
      { ({ isFocused }) => (
        <View style={ [styles.actor, isFocused && styles.actorFocused] }>
          <View>
            <ThemedImage
              style={ styles.actorPhoto }
              src={ photo }
            />
            { isDirector && (
              <View style={ styles.director }>
                <Star
                  size={ scale(12) }
                  color="yellow"
                />
                <ThemedText style={ styles.directorText }>
                  { t('Director') }
                </ThemedText>
              </View>
            ) }
          </View>
          <ThemedText
            style={ [
              styles.actorName,
              isFocused && styles.actorNameFocused,
            ] }
          >
            { name }
          </ThemedText>
          { job && (
            <ThemedText
              style={ [
                styles.actorJob,
                isFocused && styles.actorNameFocused,
              ] }
            >
              { job }
            </ThemedText>
          ) }
        </View>
      ) }
    </ThemedPressable>
  );
}

export default memo(
  FilmViewActorComponent,
  (prevProps, nextProps) => prevProps.actor.name === nextProps.actor.name
);
