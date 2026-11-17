import { FilmGrid } from 'Component/FilmGrid';
import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedImageModal } from 'Component/ThemedImageModal';
import { ThemedText } from 'Component/ThemedText';
import { Thumbnail } from 'Component/Thumbnail';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './ActorScreen.style';
import { ActorScreenComponentProps } from './ActorScreen.type';

export function ActorScreenComponent({
  isLoading,
  actor,
  onNextLoad,
  isLoadError,
  retryLoad,
}: ActorScreenComponentProps) {
  const { scale } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  const renderPhoto = () => {
    if (!actor) {
      return null;
    }

    const { photo } = actor;

    return (
      <ThemedImageModal
        src={ photo }
        modalSrc={ photo }
        style={ styles.photoWrapper }
        imageStyle={ styles.photo }
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
        <ThemedText style={ styles.text }>{ dob }</ThemedText>
        <ThemedText style={ styles.text }>{ birthPlace }</ThemedText>
        <ThemedText style={ styles.text }>{ height }</ThemedText>
      </View>
    );
  };

  const renderActorInfo = () => (
    <View>
      { renderName() }
      { renderOriginalName() }
      { renderAdditionalInfo() }
    </View>
  );

  const renderActorData = () => {
    if (isLoadError) {
      return (
        <View>
          <InfoBlock title={ t('Unable to load person') } subtitle={ t('Retry') } />
          <ThemedButton title={ t('Retry') } onPress={ retryLoad } />
        </View>
      );
    }
    if (!actor || isLoading) {
      return (
        <View style={ [styles.mainContent] }>
          <Thumbnail
            style={ styles.photoWrapper }
          />
          <View style={ [styles.additionalInfo, { marginTop: 0 }] }>
            { Array(5).fill(0).map((_, i) => (
              <Thumbnail
                // eslint-disable-next-line react/no-array-index-key
                key={ `${i}-thumb-actor-info` }
                height={ scale(16) }
                width={ scale(32) * (i+1) }
              />
            )) }
          </View>
        </View>
      );
    }

    return (
      <View style={ styles.mainContent }>
        { renderPhoto() }
        { renderActorInfo() }
      </View>
    );
  };

  const renderRoles = () => {
    const { roles = [] } = actor ?? {};

    const data = roles.map((role) => ({
      header: role.role === 'Filmography' ? t('Filmography') : role.role,
      films: role.films,
    }));

    return (
      <View style={ styles.grid }>
        <FilmGrid
          sections={ data }
          onNextLoad={ onNextLoad }
          hasMorePages={ Boolean(actor?.filmographyPage
          && actor.filmographyPage.currentPage < actor.filmographyPage.totalPages) }
          ListHeaderComponent={ renderActorData() }
        />
      </View>
    );
  };

  return (
    <Page>
      <Wrapper>
        { renderRoles() }
      </Wrapper>
    </Page>
  );
}

export default ActorScreenComponent;
