import FilmSections from 'Component/FilmSections';
import Page from 'Component/Page';
import ThemedImageModal from 'Component/ThemedImageModal';
import ThemedText from 'Component/ThemedText';
import React from 'react';
import { View } from 'react-native';

import { styles } from './ActorPage.style';
import { ActorPageThumbnail } from './ActorPage.thumbnail';
import { ActorPageComponentProps } from './ActorPage.type';

export function ActorPageComponent({
  isLoading,
  actor,
  handleSelectFilm,
}: ActorPageComponentProps) {
  if (!actor || isLoading) {
    return <ActorPageThumbnail />;
  }

  const renderPhoto = () => {
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
        <ThemedText style={ styles.text }>{ dob }</ThemedText>
        <ThemedText style={ styles.text }>{ birthPlace }</ThemedText>
        <ThemedText style={ styles.text }>{ height }</ThemedText>
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

  const renderMainData = () => (
    <View style={ styles.mainContent }>
      { renderPhoto() }
      { renderInfo() }
    </View>
  );

  const renderRoles = () => {
    const { roles } = actor;

    const data = roles.map((role) => ({
      header: role.role,
      films: role.films,
    }));

    return (
      <View style={ styles.grid }>
        <FilmSections
          data={ data }
          handleOnPress={ handleSelectFilm }
        >
          { renderMainData() }
        </FilmSections>
      </View>
    );
  };

  return (
    <Page>
      { renderRoles() }
    </Page>
  );
}

export default ActorPageComponent;
