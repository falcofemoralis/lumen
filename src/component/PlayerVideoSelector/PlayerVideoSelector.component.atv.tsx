import ThemedButton from 'Component/ThemedButton';
import ThemedModal from 'Component/ThemedModal';
import ThemedText from 'Component/ThemedText';
import { DefaultFocus, SpatialNavigationView } from 'react-tv-space-navigation';

import { styles } from './PlayerVideoSelector.style.atv';
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

    return (
      <SpatialNavigationView direction="horizontal">
        { voices.map((voice) => {
          const { id, title } = voice;

          return (
            <ThemedButton
              key={ id }
              onPress={ () => handleSelectVoice(voice) }
              isSelected={ selectedVoice.id === id }
            >
              { title }
            </ThemedButton>
          );
        }) }
      </SpatialNavigationView>
    );
  };

  const renderSeasons = () => (
    <SpatialNavigationView direction="horizontal">
      { seasons.map((season) => {
        const { seasonId, name } = season;

        return (
          <ThemedButton
            key={ seasonId }
            isSelected={ selectedSeasonId === seasonId }
            onPress={ () => setSelectedSeasonId(seasonId) }
          >
            { name }
          </ThemedButton>
        );
      }) }
    </SpatialNavigationView>
  );

  const renderEpisodes = () => (
    <SpatialNavigationView direction="horizontal">
      { episodes.map((episode) => {
        const { episodeId, name } = episode;

        return (
          <ThemedButton
            key={ episodeId }
            isSelected={ selectedEpisodeId === episodeId }
            onPress={ () => setSelectedEpisodeId(episodeId) }
          >
            { name }
          </ThemedButton>
        );
      }) }
    </SpatialNavigationView>
  );

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
      style={ styles.container }
    >
      <DefaultFocus>
        <ThemedText>Select series</ThemedText>
        { renderLoader() }
        { renderVoices() }
        { renderSeasons() }
        { renderEpisodes() }
        <ThemedButton onPress={ handleOnPlay }>Play</ThemedButton>
      </DefaultFocus>
    </ThemedModal>
  );
}

export default PlayerVideoSelectorComponent;
