import ThemedModal from 'Component/ThemedModal';
import ThemedText from 'Component/ThemedText';
import { Button } from 'react-native-paper';

import { styles } from './PlayerVideoSelector.style';
import { PlayerVideoSelectorComponentProps } from './PlayerVideoSelector.type';

export function PlayerVideoSelectorComponent({
  visible,
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

    return voices.map((voice) => (
      <Button
        key={ voice.id }
        onPress={ () => handleSelectVoice(voice) }
      >
        <ThemedText style={ selectedVoice.id === voice.id ? { color: 'green' } : {} }>
          { voice.title }
        </ThemedText>
      </Button>
    ));
  };

  const renderSeasons = () => seasons.map((season) => (
    <Button key={ season.seasonId }>
      <ThemedText style={ selectedSeasonId === season.seasonId ? { color: 'green' } : {} }>
        { season.name }
      </ThemedText>
    </Button>
  ));

  const renderEpisodes = () => episodes.map((episode) => (
    <Button key={ episode.episodeId }>
      <ThemedText style={ selectedEpisodeId === episode.episodeId ? { color: 'green' } : {} }>
        { episode.name }
      </ThemedText>
    </Button>
  ));

  const renderLoader = () => {
    if (!isLoading) {
      return null;
    }

    return <ThemedText>Loading...</ThemedText>;
  };

  return (
    <ThemedModal
      visible={ visible }
      onHide={ onHide }
      contentContainerStyle={ styles.container }
      style={ styles.background }
    >
      { renderLoader() }
      { renderVoices() }
      { renderSeasons() }
      { renderEpisodes() }
      <Button onPress={ handleOnPlay }>Play</Button>
    </ThemedModal>
  );
}

export default PlayerVideoSelectorComponent;
