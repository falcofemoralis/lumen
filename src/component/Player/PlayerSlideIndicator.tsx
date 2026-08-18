import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import Sun from 'lucide-react-native/icons/sun';
import SunDim from 'lucide-react-native/icons/sun-dim';
import Volume1 from 'lucide-react-native/icons/volume-1';
import Volume2 from 'lucide-react-native/icons/volume-2';
import VolumeX from 'lucide-react-native/icons/volume-x';
import { ComponentType, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedReaction, useAnimatedStyle } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useAppTheme } from 'Theme/context';

import { PlayerSlideControl } from './Player.config';
import { componentStyles } from './Player.style';
import { PlayerSlideIndicatorState } from './Player.type';

const HALF_LEVEL = 50;

const getIcon = (control: PlayerSlideControl, percentage: number) => {
  if (control === PlayerSlideControl.BRIGHTNESS) {
    return percentage < HALF_LEVEL ? SunDim : Sun;
  }

  if (percentage === 0) {
    return VolumeX;
  }

  return percentage < HALF_LEVEL ? Volume1 : Volume2;
};

// a real component rather than a render helper, so that the icon picked for the current
// level reaches it as a prop instead of being built where it is rendered
// (see react-hooks/static-components)
const SlideIcon = ({ IconComponent }: { IconComponent: ComponentType<any> }) => {
  const { scale, theme } = useAppTheme();

  return (
    <IconComponent
      size={ scale(20) }
      color={ theme.colors.iconOnContrast }
    />
  );
};

/**
 * The level a slide gesture is setting, shown on the half of the player opposite the
 * finger so that the hand does not cover the thing it is adjusting.
 *
 * It is driven entirely by shared values: the bar, the fade and the side it lands on all
 * run on the UI thread, and only the whole percent behind the icon and the label crosses
 * over to React, so a drag re-renders this alone and never the player around it.
 */
export const PlayerSlideIndicator = ({
  control,
  indicator: { value, opacity, offset },
}: {
  control: PlayerSlideControl;
  indicator: PlayerSlideIndicatorState;
}) => {
  const styles = useThemedStyles(componentStyles);
  const [percentage, setPercentage] = useState(0);

  useAnimatedReaction(
    () => Math.round(value.value * 100),
    (current, previous) => {
      if (current !== previous) {
        scheduleOnRN(setPercentage, current);
      }
    }
  );

  const containerAnimation = useAnimatedStyle(() => ({
    opacity: opacity.value,
    left: `${offset.value}%`,
  }));

  const fillAnimation = useAnimatedStyle(() => ({
    height: `${value.value * 100}%`,
  }));

  return (
    <Animated.View style={ [styles.slideIndicator, containerAnimation] }>
      <View style={ styles.slideIndicatorContainer }>
        <SlideIcon IconComponent={ getIcon(control, percentage) } />
        <View style={ styles.slideIndicatorTrack }>
          <Animated.View style={ [styles.slideIndicatorFill, fillAnimation] } />
        </View>
        <ThemedText style={ styles.slideIndicatorText } numberOfLines={ 1 }>
          { `${percentage}%` }
        </ThemedText>
      </View>
    </Animated.View>
  );
};

export default PlayerSlideIndicator;
