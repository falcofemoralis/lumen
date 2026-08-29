import { ThemedImage } from 'Component/ThemedImage';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Star from 'lucide-react-native/icons/star';
import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './FilmViewActor.style';
import { FilmViewActorComponentProps } from './FilmViewActor.type';

export function FilmViewActorComponent({
  actor,
  handleSelectActor,
}: FilmViewActorComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const { scale } = useAppTheme();

  const {
    name,
    photo,
    job,
    isDirector,
    link,
  } = actor;

  return (
    <Pressable
      style={ styles.actor }
      onPress={ () => handleSelectActor(link ?? '') }
    >
      <View>
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
        <ThemedText style={ styles.actorName }>
          { name }
        </ThemedText>
        { job && (
          <ThemedText style={ styles.actorJob }>
            { job }
          </ThemedText>
        ) }
      </View>
    </Pressable>
  );
}

export default memo(
  FilmViewActorComponent,
  (prevProps, nextProps) => prevProps.actor.name === nextProps.actor.name
);
