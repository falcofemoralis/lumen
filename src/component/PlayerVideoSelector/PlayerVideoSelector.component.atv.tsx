import Loader from 'Component/Loader';
import ThemedButton from 'Component/ThemedButton';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedModal from 'Component/ThemedModal';
import { DefaultFocus, SpatialNavigationView } from 'react-tv-space-navigation';

import { PLAYER_VIDEO_SELECTOR_OVERLAY_ID } from './PlayerVideoSelector.config';
import { styles } from './PlayerVideoSelector.style.atv';
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
      <ThemedDropdown
        data={ voices.map((voice) => ({
          label: voice.title,
          value: voice.id,
          startIcon: voice.premiumIcon,
          endIcon: voice.img,
        })) }
        value={ selectedVoice.id }
        onChange={ (item) => handleSelectVoice(item.value) }
        searchPlaceholder="Search voice"
        style={ styles.voicesInput }
      />
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
            style={ styles.button }
          >
            { name }
          </ThemedButton>
        );
      }) }
    </SpatialNavigationView>
  );

  const renderEpisodes = () => (
    <SpatialNavigationView
      direction="horizontal"
      style={ styles.episodesContainer }
    >
      { episodes.map(({ episodeId, name }) => (
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
      )) }
    </SpatialNavigationView>
  );

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
    >
      { renderLoader() }
      { renderVoices() }
      { renderSeasons() }
      { renderEpisodes() }
    </ThemedModal>
  );
}

export default PlayerVideoSelectorComponent;
