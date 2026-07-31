import {
  NAVIGATION_BAR_ANIMATION_DURATION_MS,
  NAVIGATION_BAR_TV_TAB_WIDTH,
  NAVIGATION_BAR_TV_TAB_WIDTH_EXPANDED,
  NAVIGATION_BAR_Z_INDEX,
} from 'Component/NavigationBar/NavigationBar.style.atv';
import { useNavigationContext } from 'Context/NavigationContext';
import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAppTheme } from 'Theme/context';

/**
 * Hides the rendered scene while the sidebar previews a different tab, without
 * unmounting it.
 *
 * The scene keeps its state, its nested stack and its registered focus keys —
 * only the pixels are covered, and the fade runs on the UI thread.
 */
export function SceneMask() {
  const { isSceneHidden } = useNavigationContext();
  const { theme } = useAppTheme();
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(isSceneHidden ? 1 : 0, {
      duration: NAVIGATION_BAR_ANIMATION_DURATION_MS,
    });
  }, [isSceneHidden, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={ [
        {
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          // the bar is expanded whenever the mask is visible, so this lines up
          // exactly with the scene area next to it
          left: theme.scale(NAVIGATION_BAR_TV_TAB_WIDTH)
            + theme.scale(NAVIGATION_BAR_TV_TAB_WIDTH_EXPANDED),
          backgroundColor: theme.colors.background,
          zIndex: NAVIGATION_BAR_Z_INDEX + 1,
        },
        animatedStyle,
      ] }
    />
  );
}

export default SceneMask;
