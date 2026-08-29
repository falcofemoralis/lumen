import { Loader } from 'Component/Loader';
import {
  NAVIGATION_BAR_ANIMATION_DURATION_MS,
  NAVIGATION_BAR_TV_TAB_WIDTH,
  NAVIGATION_BAR_TV_TAB_WIDTH_EXPANDED,
  NAVIGATION_BAR_Z_INDEX,
} from 'Component/NavigationBar/NavigationBar.style.atv';
import { useNavigationContext } from 'Context/NavigationContext';
import Animated, { useAnimatedStyle, withDelay, withTiming } from 'react-native-reanimated';
import { useAppTheme } from 'Theme/context';

// Covering the scene has to be quick -- it happens while the user is already
// moving on to another tab, and watching the old screen dim reads as lag.
// Revealing the new one can afford the slower, softer sidebar timing.
const MASK_FADE_IN_MS = 150;
const MASK_FADE_OUT_MS = NAVIGATION_BAR_ANIMATION_DURATION_MS;

// Hold the spinner back just long enough that merely passing through a tab
// never flashes one -- it only shows up once the wait is real.
const LOADER_DELAY_MS = 250;
const LOADER_FADE_IN_MS = 200;
const LOADER_FADE_OUT_MS = 100;

/**
 * Hides the rendered scene while the sidebar previews a different tab, without
 * unmounting it.
 *
 * The scene keeps its state, its nested stack and its registered focus keys --
 * only the pixels are covered, and both the fade and the spinner run on the UI
 * thread, off the back of a shared value, so previewing a tab never re-renders
 * the app.
 */
export function SceneMask() {
  const { isSceneHidden } = useNavigationContext();
  const { theme } = useAppTheme();

  const maskStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isSceneHidden.value ? 1 : 0, {
      duration: isSceneHidden.value ? MASK_FADE_IN_MS : MASK_FADE_OUT_MS,
    }),
  }));

  const loaderStyle = useAnimatedStyle(() => ({
    opacity: isSceneHidden.value
      ? withDelay(LOADER_DELAY_MS, withTiming(1, { duration: LOADER_FADE_IN_MS }))
      : withTiming(0, { duration: LOADER_FADE_OUT_MS }),
  }));

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
          alignItems: 'center',
          justifyContent: 'center',
        },
        maskStyle,
      ] }
    >
      <Animated.View style={ loaderStyle }>
        <Loader />
      </Animated.View>
    </Animated.View>
  );
}

export default SceneMask;
