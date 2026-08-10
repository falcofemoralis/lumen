import { FilmGrid } from 'Component/FilmGrid';
import { Page } from 'Component/Page';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedText } from 'Component/ThemedText';
import { Thumbnail } from 'Component/Thumbnail';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './ActorScreen.style.atv';
import { ActorScreenComponentProps } from './ActorScreen.type';

export function ActorScreenComponent({
  isLoading,
  actor,
}: ActorScreenComponentProps) {
  const { scale } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  const renderPhoto = () => {
    if (!actor) {
      return null;
    }

    const { photo } = actor;

    return (
      <ThemedImage
        style={ styles.photo }
        src={ photo }
      />
    );
  };

  const renderName = () => {
    if (!actor) {
      return null;
    }

    const { name } = actor;

    return (
      <ThemedText style={ styles.name }>
        { name }
      </ThemedText>
    );
  };

  const renderOriginalName = () => {
    if (!actor) {
      return null;
    }

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
    if (!actor) {
      return null;
    }

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
        <View>
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
          <Thumbnail
            width='20%'
            height={ scale(32) }
            style={ { marginBlock: scale(12) } }
          />
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
      <FilmGrid
        sections={ data }
        ListHeaderComponent={ renderMainData() }
      />
    );
  };

  return (
    <Page>
      { renderRoles() }
    </Page>
  );
}

export default ActorScreenComponent;
