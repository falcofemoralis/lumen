import ThemedButton from 'Component/ThemedButton';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedModal from 'Component/ThemedModal';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { ScrollView } from 'react-native';
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
  setSelectedEpisodeId,
  seasons,
  episodes,
  handleOnPlay,
}: PlayerVideoSelectorComponentProps) {
  const renderVoices = () => {
    if (voices.length <= 1) {
      return null;
    }

    return (
      <ThemedView style={ styles.voicesContainer }>
        <ThemedDropdown
          data={ voices.map((voice) => ({
            label: voice.title,
            value: voice.id,
            startIcon: voice.premiumIcon,
            endIcon: voice.img,
          })) }
          value={ selectedVoice.id }
          onChange={ (item) => handleSelectVoice(item.value) }
        />
      </ThemedView>
    );
  };

  const renderSeasons = () => (
    <ThemedView style={ styles.seasonsContainer }>
      { seasons.map((season) => (
        <Button
          key={ season.seasonId }
          style={ styles.season }
          onPress={ () => setSelectedSeasonId(season.seasonId) }
        >
          <ThemedText style={ [
            styles.seasonText,
            selectedSeasonId === season.seasonId ? styles.seasonTextSelected : undefined,
          ] }
          >
            { season.name }
          </ThemedText>
        </Button>
      )) }
    </ThemedView>
  );

  const renderEpisodes = () => (
    <ThemedView style={ styles.episodesContainer }>
      { episodes.map((episode) => (
        <Button
          key={ episode.episodeId }
          style={ styles.episode }
          onPress={ () => setSelectedEpisodeId(episode.episodeId) }
        >
          <ThemedText style={ [
            styles.episodeText,
            selectedEpisodeId === episode.episodeId ? styles.episodeTextSelected : undefined,
          ] }
          >
            { episode.name }
          </ThemedText>
        </Button>
      )) }
    </ThemedView>
  );

  const renderPlayButton = () => (
    <ThemedView style={ styles.playContainer }>
      <ThemedButton
        style={ styles.playBtn }
        onPress={ handleOnPlay }
      >
        Play
      </ThemedButton>
    </ThemedView>
  );

  const renderLoader = () => {
    if (!isLoading) {
      return null;
    }

    return <ThemedText>Loading...</ThemedText>;
  };

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
        { renderSeasons() }
        { renderEpisodes() }
        { renderPlayButton() }
      </ScrollView>
    </ThemedModal>
  );
}

export default PlayerVideoSelectorComponent;
