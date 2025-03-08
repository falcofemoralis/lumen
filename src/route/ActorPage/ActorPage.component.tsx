import FilmList from 'Component/FilmList';
import Page from 'Component/Page';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import Thumbnail from 'Component/Thumbnail';
import React from 'react';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { NUMBER_OF_COLUMNS } from './ActorPage.config';
import { styles } from './ActorPage.style';
import { ActorPageComponentProps } from './ActorPage.type';

export function ActorPageComponent({
  isLoading,
  actor,
  handleSelectFilm,
}: ActorPageComponentProps) {
  if (!actor || isLoading) {
    return (
      <Page>
        <ThemedView>
          { Array(5).fill(0).map((_, i) => (
            <Thumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `${i}-thumb` }
              height={ scale(32) }
              width={ scale(110) }
            />
          )) }
        </ThemedView>
        { /* <View style={ styles.mainContent }>
          <Thumbnail style={ styles.poster } />
          <Thumbnail style={ styles.mainInfo } />
        </View>
        <Loader
          isLoading
          fullScreen
        /> */ }
      </Page>
    );
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
        <FilmList
          data={ data }
          handleOnPress={ handleSelectFilm }
          numberOfColumns={ NUMBER_OF_COLUMNS }
        >
          { renderMainData() }
        </FilmList>
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
