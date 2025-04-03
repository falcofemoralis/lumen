import Loader from 'Component/Loader';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import React, { useRef } from 'react';
import {
  Dimensions, ScrollView,
  TouchableOpacity, View,
} from 'react-native';
import { Button } from 'react-native-paper';
import RBSheet from 'react-native-raw-bottom-sheet';
import Colors from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { styles } from './PlayerVideoSelector.style';
import { PlayerVideoSelectorComponentProps, RBSheetRef } from './PlayerVideoSelector.type';

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
  const refRBSheet = useRef<RBSheetRef>(null);

  const renderVoiceRating = () => {
    const { voiceRating = [] } = film;

    if (!voiceRating.length) {
      return null;
    }

    const { width } = Dimensions.get('window');
    const barWidth = width - styles.voiceRatingPercentContainer.width
      - styles.voiceRatingItemContainer.padding * 2;

    return (
      <>
        <TouchableOpacity
          onPress={ () => refRBSheet.current?.open() }
          style={ styles.voiceRatingInputContainer }
        >
          <ThemedIcon
            style={ [
              styles.voiceDropdownInputIcon,
              seasons.length ? styles.voiceDropdownInputIconSeason : undefined,
            ] }
            icon={ {
              pack: IconPackType.Octicons,
              name: 'question',
            } }
            size={ scale(24) }
            color={ Colors.white }
          />
        </TouchableOpacity>
        <RBSheet
          ref={ refRBSheet }
          draggable
          height={ Dimensions.get('window').height / 2 }
          closeOnPressBack
          closeOnPressMask
          customModalProps={ {
            animationType: 'slide',
            statusBarTranslucent: true,
          } }
          customStyles={ {
            container: styles.voiceRatingSheetContainer,
            draggableIcon: styles.voiceRatingSheetIcon,
          } }
        >
          <ScrollView style={ styles.voiceRatingContainer }>
            { voiceRating.map((item) => (
              <View
                key={ item.title }
                style={ styles.voiceRatingItemContainer }
              >
                <View style={ styles.voiceRatingInfo }>
                  <View style={ styles.voiceRatingTextContainer }>
                    <ThemedText style={ styles.voiceRatingText }>
                      { item.title }
                    </ThemedText>
                  </View>
                  <View style={ styles.voiceRatingBarContainer }>
                    <View style={ [
                      styles.voiceRatingBar,
                      { width: barWidth },
                    ] }
                    />
                    <View style={ [
                      styles.voiceRatingBar,
                      styles.voiceRatingBarActive,
                      { width: barWidth * (item.rating / 100) },
                    ] }
                    />
                  </View>
                </View>
                <View style={ styles.voiceRatingPercentContainer }>
                  <ThemedText style={ styles.voiceRatingPercent }>
                    { `${item.rating}%` }
                  </ThemedText>
                </View>
              </View>
            )) }
          </ScrollView>
        </RBSheet>
      </>
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
