import { ThemedButton } from 'Component/ThemedButton';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { CircleHelp } from 'lucide-react-native';
import { useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { VoiceRatingInterface } from 'Type/VoiceRating.interface';

import { componentStyles } from './PlayerVideoRating.style.atv';
import { PlayerVideoRatingComponentProps } from './PlayerVideoRating.type';

export const PlayerVideoRatingComponent = ({
  film,
}: PlayerVideoRatingComponentProps) => {
  const ratingOverlayRef = useRef<ThemedOverlayRef>(null);
  const { scale } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  const barWidth = useMemo(() => (
    styles.voiceRatingOverlay.width
    - styles.voiceRatingPercentContainer.width
    - styles.voiceRatingItemContainer.padding * 2
    - styles.voiceRatingNavigationView.paddingHorizontal * 2
  ), [styles]);

  const renderButton = () => {
    return (
      <ThemedButton
        title=""
        IconComponent={ CircleHelp }
        iconProps={ {
          size: scale(20),
        } }
        onPress={ () => ratingOverlayRef.current?.open() }
        style={ styles.voiceRatingInput }
      />
    );
  };

  const renderRating = (item: VoiceRatingInterface, index: number) => {
    return (
      <ThemedPressable key={ item.title } autofocus={ index === 0 } style={ styles.voiceRatingButton }>
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
          <ThemedScrollView>
            <View style={ styles.voiceRatingNavigationView }>
              { voiceRating.map((item, index) => renderRating(item, index)) }
            </View>
          </ThemedScrollView>
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