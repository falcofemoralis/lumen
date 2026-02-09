import { FilmSections } from 'Component/FilmSections';
import { Page } from 'Component/Page';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedText } from 'Component/ThemedText';
import { Thumbnail } from 'Component/Thumbnail';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { View } from 'react-native';
import { DefaultFocus } from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';
import { ActorInterface } from 'Type/Actor.interface';

import { componentStyles } from './ActorScreen.style.atv';
import { ActorScreenComponentProps } from './ActorScreen.type';

export function ActorScreenComponent({
  isLoading,
  actor,
  handleSelectFilm,
}: ActorScreenComponentProps) {
  const { scale } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  if (!actor) {
    actor = null as unknown as ActorInterface; // dirty hack to avoid null checks
  }

  const renderPhoto = () => {
    const { photo } = actor;

    return (
      <ThemedImage
        style={ styles.photo }
        src={ photo }
      />
    );
  };

  const renderName = () => {
    const { name } = actor;

    return (
      <ThemedText style={ styles.name }>
        { name }
      </ThemedText>
    );
  };

  const renderOriginalName = () => {
    const { originalName } = actor;

    if (!originalName) {
      return null;
    }

    return (
      <ThemedText style={ styles.originalName }>
        { originalName }
      </ThemedText>
    );
  };

  const renderAdditionalInfo = () => {
    const {
      dob,
      birthPlace,
      height,
    } = actor;

    return (
      <View style={ styles.additionalInfo }>
        { dob && <ThemedText style={ styles.text }>{ dob }</ThemedText> }
        { birthPlace && <ThemedText style={ styles.text }>{ birthPlace }</ThemedText> }
        { height && <ThemedText style={ styles.text }>{ height }</ThemedText> }
      </View>
    );
  };

  const renderInfo = () => (
    <View>
      { renderName() }
      { renderOriginalName() }
      { renderAdditionalInfo() }
    </View>
  );

  const renderMainData = () => {
    if (!actor || isLoading) {
      return (
        <View style={ styles.mainContent }>
          <Thumbnail
            style={ styles.photo }
          />
          <View style={ [styles.additionalInfo, { marginTop: 0 }] }>
            { Array(5).fill(0).map((_, i) => (
              <Thumbnail
                // eslint-disable-next-line react/no-array-index-key
                key={ `$actor-thumb-${i}` }
                height={ scale(32) }
                width={ scale(200) }
              />
            )) }
          </View>
        </View>
      );
    }

    return (
      <View style={ styles.mainContent }>
        { renderPhoto() }
        { renderInfo() }
      </View>
    );
  };

  const renderRoles = () => {
    const { roles = [] } = actor ?? {};

    const data = roles.map((role) => ({
      header: role.role,
      films: role.films,
    }));

    return (
      <DefaultFocus>
        <FilmSections
          data={ data }
          handleOnPress={ handleSelectFilm }
        >
          { renderMainData() }
        </FilmSections>
      </DefaultFocus>
    );
  };

  return (
    <Page>
      { renderRoles() }
    </Page>
  );
}

export default ActorScreenComponent;
