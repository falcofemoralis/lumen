import Loader from 'Component/Loader';
import PlayerVideoRating from 'Component/PlayerVideoRating';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import React from 'react';
import {
  ScrollView,
  View,
} from 'react-native';

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
          header={ t('Search voice') }
          onChange={ (item) => handleSelectVoice(item.value) }
          asList={ !seasons.length }
          style={ styles.voiceDropdownInput }
        />
        { seasons.length ? renderVoiceRating() : null }
      </View>
    );
  };

  const renderSeasons = () => (
    <View style={ styles.seasonsContainer }>
      { seasons.map((season) => (
        <ThemedPressable
          key={ season.seasonId }
          style={ [
            styles.season,
            selectedSeasonId === season.seasonId && styles.seasonSelected,
          ] }
          contentStyle={ styles.seasonContent }
          onPress={ () => setSelectedSeasonId(season.seasonId) }
        >
          <ThemedText
            style={ [
              styles.seasonText,
              selectedSeasonId === season.seasonId && styles.seasonTextSelected,
            ] }
          >
            { season.name }
          </ThemedText>
        </ThemedPressable>
      )) }
    </View>
  );

  const renderEpisodes = () => (
    <View style={ styles.episodesContainer }>
      { episodes.map(({ episodeId, name }) => (
        <ThemedPressable
          key={ episodeId }
          style={ [
            styles.episode,
            selectedEpisodeId === episodeId && styles.episodeSelected,
          ] }
          onPress={ () => handleSelectEpisode(episodeId) }
          contentStyle={ styles.episodeContent }
        >
          <ThemedText style={ [
            styles.episodeText,
            selectedEpisodeId === episodeId && styles.episodeTextSelected,
          ] }
          >
            { name }
          </ThemedText>
        </ThemedPressable>
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
