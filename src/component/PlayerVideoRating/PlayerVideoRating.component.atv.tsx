import ThemedButton from 'Component/ThemedButton';
import ThemedImage from 'Component/ThemedImage';
import ThemedOverlay from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import { CircleHelp } from 'lucide-react-native';
import { useMemo, useRef } from 'react';
import { View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationScrollView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import { VoiceRatingInterface } from 'Type/VoiceRating.interface';
import { scale } from 'Util/CreateStyles';

import { styles } from './PlayerVideoRating.style.atv';
import { PlayerVideoRatingComponentProps } from './PlayerVideoRating.type';

export const PlayerVideoRatingComponent = ({
  film,
}: PlayerVideoRatingComponentProps) => {
  const ratingOverlayRef = useRef<ThemedOverlayRef>(null);

  const barWidth = useMemo(() => (
    styles.voiceRatingOverlay.width
    - styles.voiceRatingPercentContainer.width
    - styles.voiceRatingItemContainer.padding * 2
    - styles.voiceRatingNavigationView.paddingHorizontal * 2
  ), []);

  const renderButton = () => {
    return (
      <ThemedButton
        IconComponent={ CircleHelp }
        iconProps={ {
          size: scale(20),
        } }
        onPress={ () => ratingOverlayRef.current?.open() }
        style={ styles.voiceRatingInput }
      />
    );
  };

  const renderRating = (item: VoiceRatingInterface) => {
    return (
      <ThemedPressable key={ item.title } withAnimation>
        { ({ isFocused }) => (
          <View
            style={ [
              styles.voiceRatingItemContainer,
              isFocused && styles.voiceRatingItemContainerFocused,
            ] }
          >
            <View style={ styles.voiceRatingInfo }>
              <View style={ styles.voiceRatingTextContainer }>
                <ThemedText
                  style={ [
                    styles.voiceRatingText,
                    isFocused && styles.voiceRatingTextFocused,
                  ] }
                >
                  { item.title }
                </ThemedText>
                { item.img && (
                  <ThemedImage
                    src={ item.img }
                    style={ styles.voiceRatingImage }
                  />
                ) }
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
              <ThemedText style={ [
                styles.voiceRatingPercent,
                isFocused && styles.voiceRatingPercentFocused,
              ] }
              >
                { `${item.rating}%` }
              </ThemedText>
            </View>
          </View>
        ) }
      </ThemedPressable>
    );
  };

  const renderOverlay = () => {
    const { voiceRating = [] } = film;

    return (
      <ThemedOverlay
        ref={ ratingOverlayRef }
        contentContainerStyle={ styles.voiceRatingOverlay }
        containerStyle={ styles.voiceRatingOverlayContainer }
      >
        <View style={ styles.voiceRatingContainer }>
          <SpatialNavigationScrollView
            offsetFromStart={ styles.voiceRatingOverlay.height / 2 }
          >
            <SpatialNavigationView
              direction="vertical"
              style={ styles.voiceRatingNavigationView }
            >
              <DefaultFocus>
                { voiceRating.map((item) => renderRating(item)) }
              </DefaultFocus>
            </SpatialNavigationView>
          </SpatialNavigationScrollView>
        </View>
      </ThemedOverlay>
    );
  };

  return (
    <>
      { renderButton() }
      { renderOverlay() }
    </>
  );
};

export default PlayerVideoRatingComponent;