import FilmCard from 'Component/FilmCard';
import FilmList from 'Component/FilmList';
import { ROW_GAP } from 'Component/FilmList/FilmList.style.atv';
import Page from 'Component/Page';
import ThemedImageModal from 'Component/ThemedImageModal';
import ThemedText from 'Component/ThemedText';
import Thumbnail from 'Component/Thumbnail';
import React from 'react';
import { View } from 'react-native';
import { calculateItemWidth } from 'Style/Layout';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';
import { scale } from 'Util/CreateStyles';

import { NUMBER_OF_COLUMNS } from './ActorPage.config';
import { styles } from './ActorPage.style';
import { ActorPageComponentProps } from './ActorPage.type';

export function ActorPageComponent({
  isLoading,
  actor,
  handleSelectFilm,
}: ActorPageComponentProps) {
  const itemWidth = calculateItemWidth(NUMBER_OF_COLUMNS);

  if (!actor || isLoading) {
    const filmThumbs = Array(NUMBER_OF_COLUMNS).fill({
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
              style={ styles.photoWrapper }
            />
            <View style={ [styles.additionalInfo, { marginTop: 0 }] }>
              { Array(5).fill(0).map((_, i) => (
                <Thumbnail
                  // eslint-disable-next-line react/no-array-index-key
                  key={ `${i}-actor-thumb` }
                  height={ scale(16) }
                  width={ scale(200) }
                />
              )) }
            </View>
          </View>
          <View style={ [styles.additionalInfo, { marginTop: 0 }] }>
            <Thumbnail
              height={ scale(24) }
              width={ scale(200) }
            />
            <View style={ {
              flexDirection: 'row',
              gap: scale(16),
            } }
            >
              { filmThumbs.map((item, i) => (
                <FilmCard
                // eslint-disable-next-line react/no-array-index-key
                  key={ `${i}-actor-film-thumb` }
                  filmCard={ item }
                  style={ {
                    // TODO: Rework
                    width: itemWidth - scale(ROW_GAP),
                  } }
                  isThumbnail
                />
              )) }
            </View>
          </View>
        </View>
      </Page>
    );
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
