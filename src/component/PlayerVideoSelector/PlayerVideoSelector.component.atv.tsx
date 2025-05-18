import Loader from 'Component/Loader';
import ThemedButton from 'Component/ThemedButton';
import ThemedDropdown from 'Component/ThemedDropdown';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedText from 'Component/ThemedText';
import { useOverlayContext } from 'Context/OverlayContext';
import t from 'i18n/t';
import React, { useId } from 'react';
import { View } from 'react-native';
import {
  DefaultFocus, SpatialNavigationFocusableView, SpatialNavigationScrollView, SpatialNavigationView,
} from 'react-tv-space-navigation';
import { EpisodeInterface, SeasonInterface } from 'Type/FilmVoice.interface';
import { scale } from 'Util/CreateStyles';

import { styles } from './PlayerVideoSelector.style.atv';
import { PlayerVideoSelectorComponentProps } from './PlayerVideoSelector.type';

export function PlayerVideoSelectorComponent({
  overlayId,
  voices,
  onHide,
  isLoading,
  selectedVoice,
  selectedSeasonId,
  selectedEpisodeId,
  handleSelectVoice,
  setSelectedSeasonId,
  seasons,
  episodes,
  handleSelectEpisode,
  film,
}: PlayerVideoSelectorComponentProps) {
  const { openOverlay, closeOverlay } = useOverlayContext();
  const ratingOverlayId = useId();

  const renderVoiceRating = () => {
    const { voiceRating = [] } = film;

    if (!voiceRating.length) {
      return null;
    }

    const barWidth = styles.voiceRatingOverlay.width
      - styles.voiceRatingPercentContainer.width
      - styles.voiceRatingItemContainer.padding * 2;

    return (
      <>
        <ThemedButton
          icon={ {
            pack: IconPackType.Octicons,
            name: 'question',
          } }
          onPress={ () => openOverlay(ratingOverlayId) }
          style={ styles.voiceRatingInput }
          iconStyle={ styles.voiceRatingInputIcon }
          iconSize={ scale(20) }
        />
        <ThemedOverlay
          id={ ratingOverlayId }
          onHide={ () => closeOverlay(ratingOverlayId) }
          contentContainerStyle={ styles.voiceRatingOverlay }
        >
          <View style={ styles.voiceRatingContainer }>
            <SpatialNavigationScrollView
              offsetFromStart={ styles.voiceRatingOverlay.height / 2 }
            >
              <SpatialNavigationView
                direction="vertical"
              >
                <DefaultFocus>
                  { voiceRating.map((item) => (
                    <SpatialNavigationFocusableView key={ item.title }>
                      { ({ isFocused }) => (
                        <View
                          style={ [
                            styles.voiceRatingItemContainer,
                            isFocused && styles.voiceRatingItemContainerFocused,
                          ] }
                        >
                          <View style={ styles.voiceRatingInfo }>
                            <View style={ styles.voiceRatingTextContainer }>
                              <ThemedText
                                style={ [
                                  styles.voiceRatingText,
                                  isFocused && styles.voiceRatingTextFocused,
                                ] }
                              >
                                { item.title }
                              </ThemedText>
                            </View>
                            <View style={ styles.voiceRatingBarContainer }>
                              <View style={ [
                                styles.voiceRatingBar,
                                { width: barWidth },
                              ] }
                              />
                              <View style={ [
                                styles.voiceRatingBar,
                                styles.voiceRatingBarActive,
                                { width: barWidth * (item.rating / 100) },
                              ] }
                              />
                            </View>
                          </View>
                          <View style={ styles.voiceRatingPercentContainer }>
                            <ThemedText style={ [
                              styles.voiceRatingPercent,
                              isFocused && styles.voiceRatingPercentFocused,
                            ] }
                            >
                              { `${item.rating}%` }
                            </ThemedText>
                          </View>
                        </View>
                      ) }
                    </SpatialNavigationFocusableView>
                  )) }
                </DefaultFocus>
              </SpatialNavigationView>
            </SpatialNavigationScrollView>
          </View>
        </ThemedOverlay>
      </>
    );
  };

  const renderVoices = () => {
    if (voices.length <= 1) {
      return null;
    }

    if (seasons.length) {
      return (
        <SpatialNavigationView
          direction="horizontal"
          style={ styles.voicesWrapper }
        >
          <ThemedDropdown
            data={ voices.map((voice) => ({
              label: voice.title,
              value: voice.identifier,
              startIcon: voice.premiumIcon,
              endIcon: voice.img,
            })) }
            value={ selectedVoice.identifier }
            onChange={ (item) => handleSelectVoice(item.value) }
            header={ t('Search voice') }
            inputStyle={ styles.voicesInput }
            style={ styles.voicesContainer }
          />
          { seasons.length ? renderVoiceRating() : null }
        </SpatialNavigationView>
      );
    }

    return (
      <ThemedDropdown
        data={ voices.map((voice) => ({
          label: voice.title,
          value: voice.identifier,
          startIcon: voice.premiumIcon,
          endIcon: voice.img,
        })) }
        value={ selectedVoice.identifier }
        onChange={ (item) => handleSelectVoice(item.value) }
        header={ t('Search voice') }
        style={ styles.voicesListContainer }
        asList
      />
    );
  };

  const calculateRows = <T, >(list: T[]) => {
    const numberOfColumns = 4;

    const columns: T[][] = Array.from({ length: numberOfColumns }, () => []);

    list.forEach((item, index) => {
      columns[index % numberOfColumns].push(item);
    });

    const rows: T[][] = [];

    for (let i = 0; i < columns[0].length; i++) {
      const row: T[] = [];

      for (let j = 0; j < numberOfColumns; j++) {
        if (columns[j][i] !== undefined) {
          row.push(columns[j][i]);
        }
      }
      rows.push(row);
    }

    return rows;
  };

  const renderSeasons = () => {
    if (!seasons.length) {
      return null;
    }

    const rows = calculateRows<SeasonInterface>(seasons);

    return (
      <SpatialNavigationView
        alignInGrid
        direction="vertical"
      >
        { rows.map((listRow) => (
          <SpatialNavigationView
            direction="horizontal"
            key={ `${listRow[0].seasonId}-row` }
          >
            { listRow.map((season) => {
              const { seasonId, name } = season;

              return (
                <ThemedButton
                  key={ seasonId }
                  isSelected={ selectedSeasonId === seasonId }
                  onPress={ () => setSelectedSeasonId(seasonId) }
                  style={ styles.button }
                >
                  { name }
                </ThemedButton>
              );
            }) }
          </SpatialNavigationView>
        )) }
      </SpatialNavigationView>
    );
  };

  const renderEpisodes = () => {
    if (!episodes.length) {
      return null;
    }

    const rows = calculateRows<EpisodeInterface>(episodes);

    return (
      <SpatialNavigationView
        alignInGrid
        direction="vertical"
        style={ styles.episodesContainer }
      >
        { rows.map((listRow) => (
          <SpatialNavigationView
            direction="horizontal"
            key={ `${listRow[0].episodeId}-row` }
          >
            { listRow.map((season) => {
              const { episodeId, name } = season;

              return (
                <DefaultFocus
                  key={ episodeId }
                  enable={ selectedEpisodeId === episodeId }
                >
                  <ThemedButton
                    isSelected={ selectedEpisodeId === episodeId }
                    onPress={ () => handleSelectEpisode(episodeId) }
                    style={ styles.button }
                  >
                    { name }
                  </ThemedButton>
                </DefaultFocus>
              );
            }) }
          </SpatialNavigationView>
        )) }
      </SpatialNavigationView>
    );
  };

  const renderSeriesSelection = () => {
    if (!seasons.length) {
      return null;
    }

    return (
      <SpatialNavigationScrollView>
        { renderSeasons() }
        { renderEpisodes() }
      </SpatialNavigationScrollView>
    );
  };

  const renderLoader = () => (
    <Loader
      isLoading={ isLoading }
      fullScreen
    />
  );

  return (
    <ThemedOverlay
      id={ overlayId }
      onHide={ onHide }
      contentContainerStyle={ seasons.length > 0 ? styles.container : undefined }
    >
      { renderLoader() }
      { renderVoices() }
      { renderSeriesSelection() }
    </ThemedOverlay>
  );
}

export default PlayerVideoSelectorComponent;
