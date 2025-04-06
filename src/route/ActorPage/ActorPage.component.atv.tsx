import FilmSections from 'Component/FilmSections';
import Page from 'Component/Page';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import React from 'react';
import { View } from 'react-native';
import { DefaultFocus } from 'react-tv-space-navigation';

import { MAIN_CONTENT_HEIGHT_TV, styles } from './ActorPage.style.atv';
import { ActorPageThumbnail } from './ActorPage.thumbnail.atv';
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
      <DefaultFocus>
        <FilmSections
          data={ data }
          handleOnPress={ handleSelectFilm }
          contentHeight={ MAIN_CONTENT_HEIGHT_TV }
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

export default ActorPageComponent;
