import KeyboardAdjuster from 'Component/KeyboardAdjuster/KeyboardAdjuster.component';
import { Portal } from 'Component/ThemedPortal';
import { useIsScreenFocused } from 'Hooks/useIsScreenFocused';
import { useLandscape } from 'Hooks/useLandscape';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, ReactNode, useEffect, useRef } from 'react';
import { BackHandler, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { noopFn } from 'Util/Function';

import { componentStyles } from './ThemedOverlay.style';
import { ThemedOverlayComponentProps } from './ThemedOverlay.type';

// Matches the container's close delay before it unmounts the overlay, so the
// fade-out finishes just as the node is removed.
const ANIMATION_DURATION = 250;

type OverlayContentProps = {
  children: ReactNode;
  isOpened: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  transparent?: boolean;
  contentVisible: boolean;
  useKeyboardAdjustment?: boolean;
  isScreenFocused: boolean;
  handleModalRequestClose: () => void;
};

// Rendered in-window through a Portal, NOT a native Modal: a Modal is a separate
// native window, so anything the app renders around it (keyboard handling, the
// gesture root, shared context) has to be set up twice, and its own show/hide
// animation cannot be driven by the container's open/close timing.
// Mounted only while open, so the content is torn down on close.
function OverlayContent({
  children,
  isOpened,
  style,
  contentContainerStyle,
  transparent,
  contentVisible,
  useKeyboardAdjustment,
  isScreenFocused,
  handleModalRequestClose,
}: OverlayContentProps) {
  const styles = useThemedStyles(componentStyles);
  const isLandscape = useLandscape();

  // Fade in on open; fade out when isOpened flips false. The container keeps the
  // overlay mounted (contentVisible) for ANIMATION_DURATION after close, so the
  // fade-out plays before this node unmounts.
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(isOpened ? 1 : 0, { duration: ANIMATION_DURATION });
  }, [isOpened, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // Read at teardown/back-press time: an overlay that stays open on a screen that
  // has been covered by a pushed one must not act on events meant for the screen
  // on top.
  const isScreenFocusedRef = useRef(isScreenFocused);

  useEffect(() => {
    isScreenFocusedRef.current = isScreenFocused;
  }, [isScreenFocused]);

  // A native Modal closed itself on Android BACK (onRequestClose); the Portal
  // does not. Returning true both closes the overlay and stops the press from
  // reaching the app's "press back again to exit" handler. BackHandler runs
  // listeners LIFO, so this newest one wins. Read the latest close handler from a
  // ref so the subscription stays registered once for the overlay's lifetime.
  const closeRef = useRef(handleModalRequestClose);

  useEffect(() => {
    closeRef.current = handleModalRequestClose;
  }, [handleModalRequestClose]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      // An overlay left open on a screen that is no longer on top must not claim
      // the press: it is invisible, and consuming the event would cost the user
      // a back press that looks like it did nothing.
      if (!isScreenFocusedRef.current) {
        return false;
      }

      closeRef.current();

      return true;
    });

    return () => subscription.remove();
  }, []);

  return (
    <Animated.View style={ [StyleSheet.absoluteFill, animatedStyle] }>
      { /* Backdrop press closes the overlay; the inner Pressable swallows
           presses on the content so it stays open. */ }
      <Pressable
        onPress={ handleModalRequestClose }
        style={ [styles.modal, !transparent && styles.backdrop, style] }
      >
        <Pressable
          onPress={ noopFn }
          style={ [
            styles.contentContainerStyle,
            isLandscape && styles.contentContainerStyleLandscape,
            contentContainerStyle,
          ] }
        >
          { contentVisible && children }
        </Pressable>
        { useKeyboardAdjustment && <KeyboardAdjuster scale={ 0.5 } /> }
      </Pressable>
    </Animated.View>
  );
}

export function ThemedOverlayComponent({
  isOpened,
  contentContainerStyle,
  style,
  children,
  transparent,
  contentVisible,
  useKeyboardAdjustment,
  handleModalRequestClose,
  onShow,
}: ThemedOverlayComponentProps) {
  // Read here rather than inside OverlayContent: the content is portaled into
  // the page host, which drops the navigation context this hook needs.
  const isScreenFocused = useIsScreenFocused();

  useEffect(() => {
    if (isOpened) {
      onShow?.();
    }
  }, [isOpened, onShow]);

  // Keep mounted through the fade-out: isOpened flips false immediately on close
  // to start the animation, while contentVisible stays true for ANIMATION_DURATION.
  if (!isOpened && !contentVisible) {
    return null;
  }

  return (
    <Portal>
      <OverlayContent
        isOpened={ isOpened }
        style={ style }
        contentContainerStyle={ contentContainerStyle }
        transparent={ transparent }
        contentVisible={ contentVisible }
        useKeyboardAdjustment={ useKeyboardAdjustment }
        isScreenFocused={ isScreenFocused }
        handleModalRequestClose={ handleModalRequestClose }
      >
        { children }
      </OverlayContent>
    </Portal>
  );
}

function propsAreEqual(
  prevProps: ThemedOverlayComponentProps,
  props: ThemedOverlayComponentProps
) {
  return prevProps.isOpened === props.isOpened
    && prevProps.contentVisible === props.contentVisible
    && prevProps.children === props.children;
}

export default memo(ThemedOverlayComponent, propsAreEqual);
