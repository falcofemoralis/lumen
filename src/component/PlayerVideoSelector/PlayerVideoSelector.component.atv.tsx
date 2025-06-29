import Loader from 'Component/Loader';
import PlayerVideoRating from 'Component/PlayerVideoRating';
import ThemedButton from 'Component/ThemedButton';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedOverlay from 'Component/ThemedOverlay';
import t from 'i18n/t';
import React from 'react';
import {
  DefaultFocus,
  SpatialNavigationScrollView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import { EpisodeInterface, SeasonInterface } from 'Type/FilmVoice.interface';

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
