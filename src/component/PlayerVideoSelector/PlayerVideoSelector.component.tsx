import Loader from 'Component/Loader';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedModal from 'Component/ThemedModal';
import ThemedText from 'Component/ThemedText';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';

import { PLAYER_VIDEO_SELECTOR_OVERLAY_ID } from './PlayerVideoSelector.config';
import { styles } from './PlayerVideoSelector.style';
import { PlayerVideoSelectorComponentProps } from './PlayerVideoSelector.type';

export function PlayerVideoSelectorComponent({
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
}: PlayerVideoSelectorComponentProps) {
  const renderVoices = () => {
    if (voices.length <= 1) {
      return null;
    }

    return (
      <View style={ styles.voicesContainer }>
        <ThemedDropdown
          data={ voices.map((voice) => ({
            label: voice.title,
            value: voice.id,
            startIcon: voice.premiumIcon,
            endIcon: voice.img,
          })) }
          value={ selectedVoice.id }
          onChange={ (item) => handleSelectVoice(item.value) }
          asList={ !seasons.length }
        />
      </View>
    );
  };

  const renderSeasons = () => (
    <View style={ styles.seasonsContainer }>
      { seasons.map((season) => (
        <Button
          key={ season.seasonId }
          style={ [
            styles.season,
            selectedSeasonId === season.seasonId && styles.seasonSelected,
          ] }
          onPress={ () => setSelectedSeasonId(season.seasonId) }
        >
          <ThemedText style={ [
            styles.seasonText,
            selectedSeasonId === season.seasonId && styles.seasonTextSelected,
          ] }
          >
            { season.name }
          </ThemedText>
        </Button>
      )) }
    </View>
  );

  const renderEpisodes = () => (
    <View style={ styles.episodesContainer }>
      { episodes.map(({ episodeId, name }) => (
        <Button
          key={ episodeId }
          style={ [
            styles.episode,
            selectedEpisodeId === episodeId && styles.episodeSelected,
          ] }
          onPress={ () => handleSelectEpisode(episodeId) }
        >
          <ThemedText style={ [
            styles.episodeText,
            selectedEpisodeId === episodeId && styles.episodeTextSelected,
          ] }
          >
            { name }
          </ThemedText>
        </Button>
      )) }
    </View>
  );

  const renderSeriesSelection = () => {
    if (!seasons.length) {
      return null;
    }

    return (
      <>
        { renderSeasons() }
        { renderEpisodes() }
      </>
    );
  };

  const renderLoader = () => (
    <Loader
      isLoading={ isLoading }
      fullScreen
    />
  );

  return (
    <ThemedModal
      id={ PLAYER_VIDEO_SELECTOR_OVERLAY_ID }
      onHide={ onHide }
      contentContainerStyle={ styles.container }
      style={ styles.background }
    >
      <ScrollView>
        { renderLoader() }
        { renderVoices() }
        { renderSeriesSelection() }
      </ScrollView>
    </ThemedModal>
  );
}

export default PlayerVideoSelectorComponent;
