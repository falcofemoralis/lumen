import ThemedButton from 'Component/ThemedButton';
import ThemedDropdown from 'Component/ThemedDropdown';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedModal from 'Component/ThemedModal';
import ThemedText from 'Component/ThemedText';
import { View } from 'react-native';
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
    <SpatialNavigationView direction="horizontal">
      { episodes.map((episode) => {
        const { episodeId, name } = episode;

        return (
          <ThemedButton
            key={ episodeId }
            isSelected={ selectedEpisodeId === episodeId }
            onPress={ () => setSelectedEpisodeId(episodeId) }
            style={ styles.button }
          >
            { name }
          </ThemedButton>
        );
      }) }
    </SpatialNavigationView>
  );

  const renderPlay = () => (
    <View style={ styles.play }>
      <ThemedButton
        icon={ {
          name: 'play-outline',
          pack: IconPackType.MaterialCommunityIcons,
        } }
        onPress={ handleOnPlay }
      >
        Play
      </ThemedButton>
    </View>
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
      style={ styles.container }
    >
      <DefaultFocus>
        <ThemedText>Select series</ThemedText>
        { renderLoader() }
        { renderVoices() }
        { renderSeasons() }
        { renderEpisodes() }
        { renderPlay() }
      </DefaultFocus>
    </ThemedModal>
  );
}

export default PlayerVideoSelectorComponent;
