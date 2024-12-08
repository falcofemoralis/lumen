import ThemedButton from 'Component/ThemedButton';
import ThemedModal from 'Component/ThemedModal';
import ThemedText from 'Component/ThemedText';
import { DefaultFocus, SpatialNavigationView } from 'react-tv-space-navigation';
import { styles } from './FilmVideoSelector.style.atv';
import { FilmVideoSelectorComponentProps } from './FilmVideoSelector.type';

export function FilmVideoSelectorComponent(props: FilmVideoSelectorComponentProps) {
  const {
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
  } = props;

  const renderVoices = () => {
    if (voices.length <= 1) {
      return null;
    }

    return (
      <SpatialNavigationView direction="horizontal">
        {voices.map((voice) => {
          const { id, title } = voice;

          return (
            <ThemedButton
              key={id}
              onPress={() => handleSelectVoice(voice)}
              label={title}
              selected={selectedVoice.id === id}
            />
          );
        })}
      </SpatialNavigationView>
    );
  };

  const renderSeasons = () => {
    return (
      <SpatialNavigationView direction="horizontal">
        {seasons.map((season) => {
          const { seasonId, name } = season;

          return (
            <ThemedButton
              key={seasonId}
              selected={selectedSeasonId === seasonId}
              label={name}
              onPress={() => setSelectedSeasonId(seasonId)}
            />
          );
        })}
      </SpatialNavigationView>
    );
  };

  const renderEpisodes = () => {
    return (
      <SpatialNavigationView direction="horizontal">
        {episodes.map((episode) => {
          const { episodeId, name } = episode;

          return (
            <ThemedButton
              key={episodeId}
              selected={selectedEpisodeId === episodeId}
              label={name}
              onPress={() => setSelectedEpisodeId(episodeId)}
            />
          );
        })}
      </SpatialNavigationView>
    );
  };

  const renderLoader = () => {
    if (!isLoading) {
      return null;
    }

    return <ThemedText>Loading...</ThemedText>;
  };

  return (
    <ThemedModal
      visible={visible}
      onHide={onHide}
      style={styles.container}
    >
      <DefaultFocus>
        <ThemedText>Select series</ThemedText>
        {renderLoader()}
        {renderVoices()}
        {renderSeasons()}
        {renderEpisodes()}
        <ThemedButton
          onPress={handleOnPlay}
          label="Play"
        />
      </DefaultFocus>
    </ThemedModal>
  );
}

export default FilmVideoSelectorComponent;
