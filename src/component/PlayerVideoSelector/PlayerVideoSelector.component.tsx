import Loader from 'Component/Loader';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedText from 'Component/ThemedText';
import __ from 'i18n/__';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';

import { styles } from './PlayerVideoSelector.style';
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
            value: voice.identifier,
            startIcon: voice.premiumIcon,
            endIcon: voice.img,
          })) }
          value={ selectedVoice.identifier }
          header={ __('Search voice') }
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

  const renderContent = () => {
    if (!seasons.length) {
      return renderVoices();
    }

    return (
      <ScrollView>
        { renderVoices() }
        { renderSeriesSelection() }
      </ScrollView>
    );
  };

  return (
    <ThemedOverlay
      id={ overlayId }
      onHide={ onHide }
      contentContainerStyle={ styles.container }
      style={ styles.background }
    >
      { renderLoader() }
      { renderContent() }
    </ThemedOverlay>
  );
}

export default PlayerVideoSelectorComponent;
