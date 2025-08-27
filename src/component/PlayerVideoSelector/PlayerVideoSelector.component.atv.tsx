import Loader from 'Component/Loader';
import PlayerVideoRating from 'Component/PlayerVideoRating';
import ThemedButton from 'Component/ThemedButton';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedSimpleList from 'Component/ThemedSimpleList';
import t from 'i18n/t';
import React, { memo } from 'react';
import { View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationScrollView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import { EpisodeInterface, SeasonInterface } from 'Type/FilmVoice.interface';
import { getVideoProgress } from 'Util/Player';

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
  savedTime,
  calculateProgressThreshold,
}: PlayerVideoSelectorComponentProps) {
  const renderVoiceRating = () => {
    const { voiceRating = [] } = film;

    if (!voiceRating.length) {
      return null;
    }

    return (
      <PlayerVideoRating
        film={ film }
        seasons={ seasons }
        episodes={ episodes }
      />
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
          { renderVoiceRating() }
        </SpatialNavigationView>
      );
    }

    return (
      <ThemedSimpleList
        data={ voices.map((voice) => ({
          label: voice.title,
          value: voice.identifier,
          startIcon: voice.premiumIcon,
          endIcon: voice.img,
        })) }
        value={ selectedVoice.identifier }
        onChange={ (item) => handleSelectVoice(item.value) }
        header={ t('Search voice') }
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
    if (seasons.length === 1 && seasons[0].isOnlyEpisodes) {
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

  const renderEpisodeTimeline = (episodeId: string, isFocused: boolean, isSelected: boolean) => {
    if (!savedTime) {
      return null;
    }

    const progress = getVideoProgress({
      ...selectedVoice,
      lastSeasonId: selectedSeasonId,
      lastEpisodeId: episodeId,
    }, savedTime);

    if (!progress) {
      return null;
    }

    return (
      <View style={ styles.buttonProgressContainer }>
        <View style={ styles.buttonProgressOutline } />
        <View
          style={ [
            styles.buttonProgressMask,
            isSelected && styles.buttonProgressMaskSelected,
            isFocused && styles.buttonProgressMaskFocused,
            { width: `${100 - calculateProgressThreshold(progress)}%` },
          ] }
        />
      </View>
    );
  };

  const renderEpisodes = () => {
    const rows = calculateRows<EpisodeInterface>(episodes);

    return (
      <SpatialNavigationView
        alignInGrid
        direction="vertical"
        style={ [
          styles.episodesContainer,
          seasons.length === 1 && seasons[0].isOnlyEpisodes && styles.episodesContainerNoBorder,
        ] }
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
                    additionalElement={
                      (isFocused, isSelected) => renderEpisodeTimeline(episodeId, isFocused, isSelected)
                    }
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

function propsAreEqual(
  prevProps: PlayerVideoSelectorComponentProps,
  props: PlayerVideoSelectorComponentProps
) {
  return prevProps.isLoading === props.isLoading
    && prevProps.selectedVoice.id === props.selectedVoice.id
    && prevProps.selectedSeasonId === props.selectedSeasonId
    && prevProps.selectedEpisodeId === props.selectedEpisodeId
    && prevProps.savedTime === props.savedTime;
}

export default memo(PlayerVideoSelectorComponent, propsAreEqual);
