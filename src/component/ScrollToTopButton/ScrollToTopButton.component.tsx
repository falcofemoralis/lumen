import { useConfigContext } from 'Context/ConfigContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import ArrowUp from 'lucide-react-native/icons/arrow-up';
import { useCallback, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT } from 'Component/NavigationBar/NavigationBar.style';
import { useAppTheme } from 'Theme/context';

import { BUTTON_MARGIN, BUTTON_SIZE, DRAG_TAP_THRESHOLD } from './ScrollToTopButton.config';
import { componentStyles } from './ScrollToTopButton.style';
import { ScrollToTopButtonComponentProps, ScrollToTopButtonCorner } from './ScrollToTopButton.type';

// Where the button's top-left corner lands for a given named corner, given the current
// screen size and safe area -- the single source of truth both the initial placement
// and the post-drag snap read from.
const useCornerPosition = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { scale } = useAppTheme();

  const size = scale(BUTTON_SIZE);
  const margin = scale(BUTTON_MARGIN);

  return useCallback((corner: ScrollToTopButtonCorner) => {
    const x = corner.endsWith('left') ? margin : screenWidth - size - margin;
    const y = corner.startsWith('top')
      ? insets.top + margin
      : screenHeight - size - margin - insets.bottom - scale(TAB_BAR_HEIGHT);

    return { x, y };
  }, [screenWidth, screenHeight, size, margin, insets.top, insets.bottom]);
};

export function ScrollToTopButtonComponent({ visible, onPress }: ScrollToTopButtonComponentProps) {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const { scrollToTopButtonCornerMobile, setConfig } = useConfigContext();
  const getCornerPosition = useCornerPosition();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const dragStartX = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Placed at its remembered corner on mount, and whenever the screen size changes
  // (rotation) -- not animated, a rotation is not a drag.
  useEffect(() => {
    const { x, y } = getCornerPosition(scrollToTopButtonCornerMobile);

    translateX.value = x;
    translateY.value = y;
  }, [scrollToTopButtonCornerMobile, getCornerPosition, translateX, translateY]);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible, opacity]);

  const handleTap = useCallback(() => {
    onPress();
  }, [onPress]);

  // The nearest corner to wherever the finger let go, judged by which quadrant of the
  // screen the button's centre ended up in -- then snapped there and remembered.
  const persistCorner = useCallback((x: number, y: number) => {
    const centerX = x + scale(BUTTON_SIZE) / 2;
    const centerY = y + scale(BUTTON_SIZE) / 2;

    const corner: ScrollToTopButtonCorner = [
      centerY < screenHeight / 2 ? 'top' : 'bottom',
      centerX < screenWidth / 2 ? 'left' : 'right',
    ].join('-') as ScrollToTopButtonCorner;

    const target = getCornerPosition(corner);

    translateX.value = withSpring(target.x);
    translateY.value = withSpring(target.y);

    if (corner !== scrollToTopButtonCornerMobile) {
      setConfig('scrollToTopButtonCornerMobile', corner);
    }
  }, [
    scale,
    screenWidth,
    screenHeight,
    getCornerPosition,
    translateX,
    translateY,
    scrollToTopButtonCornerMobile,
    setConfig,
  ]);

  const tapGesture = Gesture.Tap()
    .hitSlop(scale(8))
    .maxDistance(DRAG_TAP_THRESHOLD)
    .onEnd(() => {
      runOnJS(handleTap)();
    });

  const panGesture = Gesture.Pan()
    .hitSlop(scale(8))
    .minDistance(DRAG_TAP_THRESHOLD)
    .onStart(() => {
      dragStartX.value = translateX.value;
      dragStartY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = dragStartX.value + e.translationX;
      translateY.value = dragStartY.value + e.translationY;
    })
    .onEnd((_e, success) => {
      if (success) {
        runOnJS(persistCorner)(translateX.value, translateY.value);
      }
    });

  const composedGesture = Gesture.Race(tapGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={ composedGesture }>
      <Animated.View
        style={ [styles.container, animatedStyle] }
        pointerEvents={ visible ? 'auto' : 'none' }
      >
        <ArrowUp
          size={ scale(20) }
          color={ theme.colors.primary }
        />
      </Animated.View>
    </GestureDetector>
  );
}

export default ScrollToTopButtonComponent;
