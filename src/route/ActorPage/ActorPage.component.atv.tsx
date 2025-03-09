import FilmCard from 'Component/FilmCard';
import { CARD_HEIGHT_TV } from 'Component/FilmCard/FilmCard.style.atv';
import FilmList from 'Component/FilmList';
import Loader from 'Component/Loader';
import Page from 'Component/Page';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import Thumbnail from 'Component/Thumbnail';
import React from 'react';
import { View } from 'react-native';
import { DefaultFocus } from 'react-tv-space-navigation';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';
import { scale } from 'Util/CreateStyles';
import { getWindowWidth } from 'Util/Window';

import { NUMBER_OF_COLUMNS_TV } from './ActorPage.config';
import { MAIN_CONTENT_HEIGHT_TV, styles } from './ActorPage.style.atv';
import { ActorPageComponentProps } from './ActorPage.type';

// TODO: Rework
const containerWidth = getWindowWidth() - scale(16);

export function ActorPageComponent({
  isLoading,
  actor,
  handleSelectFilm,
}: ActorPageComponentProps) {
  if (!actor || isLoading) {
    const filmThumbs = Array(NUMBER_OF_COLUMNS_TV).fill({
      id: '',
      link: '',
      type: FilmType.FILM,
      poster: '',
      title: '',
      subtitle: '',
      isThumbnail: true,
    }) as FilmCardInterface[];

    return (
      <Page>
        <View>
          <View style={ styles.mainContent }>
            <Thumbnail
              style={ styles.photo }
            />
            <View style={ [styles.additionalInfo, { marginTop: 0 }] }>
              { Array(5).fill(0).map((_, i) => (
                <Thumbnail
                  // eslint-disable-next-line react/no-array-index-key
                  key={ `${i}-actor-thumb` }
                  height={ scale(32) }
                  width={ scale(200) }
                />
              )) }
            </View>
          </View>
          <View style={ [styles.additionalInfo, { marginTop: 0 }] }>
            <Thumbnail
              height={ scale(42) }
              width={ scale(200) }
            />
            <View style={ {
              flexDirection: 'row',
              height: CARD_HEIGHT_TV,
              gap: 16,
            } }
            >
              { filmThumbs.map((item, i) => (
                <FilmCard
                // eslint-disable-next-line react/no-array-index-key
                  key={ `${i}-actor-film-thumb` }
                  filmCard={ item }
                  style={ {
                    // TODO: Rework
                    width: containerWidth / NUMBER_OF_COLUMNS_TV - scale(16),
                  } }
                  isThumbnail
                />
              )) }
            </View>
          </View>
        </View>
        <Loader
          isLoading
          fullScreen
        />
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
        <FilmList
          data={ data }
          handleOnPress={ handleSelectFilm }
          numberOfColumns={ NUMBER_OF_COLUMNS_TV }
          contentHeight={ MAIN_CONTENT_HEIGHT_TV }
        >
          { renderMainData() }
        </FilmList>
      </DefaultFocus>
    );
  };

  return (
    <Page>
      <View>
        { renderRoles() }
      </View>
    </Page>
  );
}

export default ActorPageComponent;
