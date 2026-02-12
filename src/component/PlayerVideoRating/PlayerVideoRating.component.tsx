import { ThemedBottomSheet } from 'Component/ThemedBottomSheet';
import { ThemedBottomSheetRef } from 'Component/ThemedBottomSheet/ThemedBottomSheet.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { CircleHelp } from 'lucide-react-native';
import { useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { VoiceRatingInterface } from 'Type/VoiceRating.interface';

import { componentStyles } from './PlayerVideoRating.style';
import { PlayerVideoRatingComponentProps } from './PlayerVideoRating.type';

export const PlayerVideoRatingComponent = ({
  film,
  seasons,
}: PlayerVideoRatingComponentProps) => {
  const bottomSheetRef = useRef<ThemedBottomSheetRef>(null);
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  const renderButton = () => {
    return (
      <ThemedPressable
        onPress={ () => bottomSheetRef.current?.present() }
        style={ styles.voiceRatingInputContainer }
      >
        <CircleHelp
          style={ [
            styles.voiceDropdownInputIcon,
            seasons.length ? styles.voiceDropdownInputIconSeason : undefined,
          ] }
          size={ scale(24) }
          color={ theme.colors.icon }
        />
      </ThemedPressable>
    );
  };

  const renderRating = (item: VoiceRatingInterface) => {
    return (
      <View
        key={ item.title }
        style={ styles.voiceRatingItemContainer }
      >
        <View style={ styles.voiceRatingInfo }>
          <View style={ styles.voiceRatingTextContainer }>
            <ThemedText style={ styles.voiceRatingText }>
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
            <View
              style={ styles.voiceRatingBar }
            />
            <View
              style={ [
                styles.voiceRatingBar,
                styles.voiceRatingBarActive,
                { width: `${item.rating}%` },
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
    );
  };

  const renderBottomSheet = () => {
    const { voiceRating = [] } = film;

    return (
      <ThemedBottomSheet ref={ bottomSheetRef } detents={ [0.4, 'auto'] }>
        <ScrollView style={ styles.voiceRatingContainer }>
          { voiceRating.map((item) => renderRating(item)) }
        </ScrollView>
      </ThemedBottomSheet>
    );
  };

  return (
    <>
      { renderButton() }
      { renderBottomSheet() }
    </>
  );
};

export default PlayerVideoRatingComponent;