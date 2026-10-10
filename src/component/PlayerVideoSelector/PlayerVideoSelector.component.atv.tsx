import { InfoBlock } from 'Component/InfoBlock';
import { Loader } from 'Component/Loader';
import { PlayerVideoRating } from 'Component/PlayerVideoRating';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { ThemedGroup } from 'Component/ThemedGroup';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { ThemedSimpleList } from 'Component/ThemedSimpleList';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { View } from 'react-native';
import { EpisodeInterface, SeasonInterface } from 'Type/FilmVoice.interface';
import { getVideoProgress } from 'Util/Player';

import { formatDownloadKey } from './PlayerVideoSelector.config';
import { componentStyles } from './PlayerVideoSelector.style.atv';
import { PlayerVideoSelectorComponentProps } from './PlayerVideoSelector.type';

export function PlayerVideoSelectorComponent({
  overlayRef,
  voices,
  isLoading,
  selectedVoice,
  selectedSeasonId,
  selectedEpisodeId,
  handleSelectVoice,
  handleSelectSeason,
  setSelectedSeasonId,
  seasons,
  episodes,
  handleSelectEpisode,
  film,
  savedTime,
  calculateProgressThreshold,
  onOverlayOpen,
  voiceOverlayRef,
  onClose,
  isDownloader,
  episodesToDownload,
  handleEpisodesDownload,
  qualityOverlayRef,
  streamQualities,
  handleDownload,
  isOffline,
  playerAskQuality,
  playerCompactSelector,
  handleQualitySelect,
}: PlayerVideoSelectorComponentProps) {
  const styles = useThemedStyles(componentStyles);

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
    if (voices.length === 0) {
      return null;
    }

    if (seasons.length) {
      return (
        <ThemedGroup style={ styles.voicesWrapper }>
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
            overlayRef={ voiceOverlayRef }
          />
          { renderVoiceRating() }
        </ThemedGroup>
      );
    }

    return (
      <ThemedSimpleList
        data={ voices.map((voice) => ({
          label: voice.title,
          value: voice.identifier,
          startIcon: voice.premiumIcon,
          endIcon: voice.img,
        })) }
        value={ selectedVoice.identifier }
        onChange={ (item) => handleSelectVoice(item.value) }
        header={ t('Search voice') }
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

  const renderSeasonTimeline = (season: SeasonInterface, isSelected: boolean) => {
    if (!savedTime || !season.episodes.length) {
      return null;
    }

    let totalProgress = 0;

    season.episodes.forEach(({ episodeId }: { episodeId: string }) => {
      const progress = getVideoProgress({
        ...selectedVoice,
        lastSeasonId: season.seasonId,
        lastEpisodeId: episodeId,
      }, savedTime);

      if (progress) {
        totalProgress += calculateProgressThreshold(progress);
      }
    });

    if (totalProgress === 0) {
      return null;
    }

    const averageProgress = totalProgress / season.episodes.length;

    return (
      <View
          style={ styles.buttonProgressContainer }
          pointerEvents="none"
        >
        <View style={ styles.buttonProgressOutline } />
        <View
          style={ [
            styles.buttonProgressMask,
            isSelected && styles.buttonProgressMaskSelected,
            { width: `${100 - averageProgress}%` },
          ] }
        />
      </View>
    );
  };

  const renderSeasons = () => {
    if (seasons.length === 1 && seasons[0].isOnlyEpisodes) {
      return null;
    }

    const rows = calculateRows<SeasonInterface>(seasons);

    return (
      <View>
        { rows.map((listRow) => (
          <View
            style={ styles.row }
            key={ `${listRow[0].seasonId}-row` }
          >
            { listRow.map((season) => {
              const { seasonId, name } = season;

              return (
                <ThemedPressable
                  key={ seasonId }
                  style={ [
                    styles.season,
                    selectedSeasonId === seasonId && styles.seasonSelected,
                  ] }
                  contentStyle={ styles.seasonContent }
                  onPress={ () => setSelectedSeasonId(seasonId) }
                  topAdditionalElement={
                    () => renderSeasonTimeline(season, selectedSeasonId === seasonId)
                  }
                >
                  <ThemedText
                    style={ [
                      styles.seasonText,
                      selectedSeasonId === seasonId && styles.seasonTextSelected,
                    ] }
                  >
                    { name }
                  </ThemedText>
                </ThemedPressable>
              );
            }) }
          </View>
        )) }
      </View>
    );
  };
  const renderEpisodeTimeline = (episodeId: string, isSelected: boolean) => {
    if (!savedTime) {
      return null;
    }

    const progress = getVideoProgress({
      ...selectedVoice,
      lastSeasonId: selectedSeasonId,
      lastEpisodeId: episodeId,
    }, savedTime);

    if (!progress) {
      return null;
    }

    return (
      <View
          style={ styles.buttonProgressContainer }
          pointerEvents="none"
        >
        <View style={ styles.buttonProgressOutline } />
        <View
          style={ [
            styles.buttonProgressMask,
            isSelected && styles.buttonProgressMaskSelected,
            { width: `${100 - calculateProgressThreshold(progress)}%` },
          ] }
        />
      </View>
    );
  };

  const renderEpisodes = () => {
    const rows = calculateRows<EpisodeInterface>(episodes);

    return (
      <View
        style={ [
          styles.episodesContainer,
          seasons.length === 1 && seasons[0].isOnlyEpisodes && styles.episodesContainerNoBorder,
        ] }
      >
        { rows.map((listRow) => (
          <View
            style={ styles.row }
            key={ `${listRow[0].episodeId}-row` }
          >
            { listRow.map((episode) => {
              const { episodeId, name } = episode;
              const isSelectedForDownload = isDownloader
                && episodesToDownload[formatDownloadKey(selectedSeasonId, episodeId)];

              return (
                <ThemedPressable
                  key={ episodeId }
                  style={ [
                    styles.episode,
                    selectedEpisodeId === episodeId && styles.episodeSelected,
                    isSelectedForDownload && styles.episodeDownloadSelected,
                  ] }
                  contentStyle={ styles.episodeContent }
                  onPress={ () => handleSelectEpisode(episodeId) }
                  autofocus={ selectedEpisodeId === episodeId }
                  topAdditionalElement={ () => renderEpisodeTimeline(episodeId, selectedEpisodeId === episodeId) }
                >
                  <ThemedText
                    style={ [
                      styles.episodeText,
                      selectedEpisodeId === episodeId && styles.episodeTextSelected,
                    ] }
                  >
                    { name }
                  </ThemedText>
                </ThemedPressable>
              );
            }) }
          </View>
        )) }
      </View>
    );
  };
  const renderCompactSeriesSelection = () => {
    if (!seasons.length || isDownloader) {
      return null;
    }

    const seasonValue = selectedSeasonId ?? seasons[0].seasonId;
    const episodeValue = episodes.some(
      ({ episodeId }) => episodeId === selectedEpisodeId
    )
      ? selectedEpisodeId ?? ''
      : episodes[0]?.episodeId ?? '';

    return (
      <View style={ styles.compactSelectorsContainer }>
        <ThemedDropdown
          data={ seasons.map(({ seasonId, name }) => ({
            label: name,
            value: seasonId,
          })) }
          value={ seasonValue }
          onChange={ (item) => handleSelectSeason(item.value) }
          header={ t('Season') }
          style={ styles.compactSelector }
          closeOnChange
        />
        <ThemedDropdown
          data={ episodes.map(({ episodeId, name }) => ({
            label: name,
            value: episodeId,
          })) }
          value={ episodeValue }
          onChange={ (item) => handleSelectEpisode(item.value) }
          header={ t('Episode') }
          style={ styles.compactSelector }
          closeOnChange
        />
      </View>
    );
  };
  const renderSeriesSelection = () => {
    if (!seasons.length) {
      return null;
    }
    if (playerCompactSelector && !isDownloader) {
      return renderCompactSeriesSelection();
    }

    return (
      <View>
        { renderSeasons() }
        { renderEpisodes() }
      </View>
    );
  };

  const renderLoader = () => (
    <Loader
      isLoading={ isLoading }
      fullScreen
    />
  );

  const renderEmpty = () => (
    <View style={ styles.empty }>
      <InfoBlock
        title={ t('No data') }
        subtitle={ t('You have not downloaded anything') }
      />
    </View>
  );

  const renderVoicesContent = () => {
    return renderVoices();
  };

  const renderSeasonsContent = () => {
    return (
      <ThemedScrollView>
        { renderVoices() }
        { renderSeriesSelection() }
      </ThemedScrollView>
    );
  };

  const renderContent = () => {
    if (film.hasSeasons && isLoading && !seasons.length) return null;
    if (isOffline && !seasons.length && (voices.length > 0 && !voices[0].video?.streams?.length)) {
      return renderEmpty();
    }

    if (seasons.length) {
      return renderSeasonsContent();
    }

    return renderVoicesContent();
  };

  const renderDownloadButton = () => {
    if (!isDownloader || !episodes.length) {
      return null;
    }

    return (
      <ThemedButton
        title={ t('Download') }
        onPress={ handleEpisodesDownload }
        disabled={ !Object.values(episodesToDownload).filter((selected) => selected).length }
        style={ styles.downloadBtn }
      />
    );
  };

  const renderQualitySelector = () => {
    if (!isDownloader && !playerAskQuality) {
      return null;
    }

    return (
      <ThemedDropdown
        data={ (streamQualities ?? []).map((quality) => ({
          label: quality,
          value: quality,
        })) }
        value={ (streamQualities ?? []).length ? (streamQualities ?? [])[0] : '' }
        onChange={ (item) => isDownloader ? handleDownload(item.value) : handleQualitySelect(item.value) }
        header={ t('Quality') }
        overlayRef={ qualityOverlayRef }
        asOverlay
      />
    );
  };

  return (
    <ThemedOverlay
      ref={ overlayRef }
      contentContainerStyle={ seasons.length > 0 ? styles.containerSeasons : styles.containerVoices }
      onOpen={ onOverlayOpen }
      onClose={ onClose }
    >
      { renderQualitySelector() }
      { renderLoader() }
      { renderDownloadButton() }
      { renderContent() }
    </ThemedOverlay>
  );
}

export default PlayerVideoSelectorComponent;


