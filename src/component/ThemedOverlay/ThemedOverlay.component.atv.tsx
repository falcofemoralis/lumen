import { doesFocusableExist, getCurrentFocusKey, setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import KeyboardAdjuster from 'Component/KeyboardAdjuster/KeyboardAdjuster.component';
import { Portal } from 'Component/ThemedPortal';
import { OverlayScopeProvider } from 'Context/OverlayContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, ReactNode, useEffect, useRef } from 'react';
import { BackHandler, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { noopFn } from 'Util/Function';

import { componentStyles } from './ThemedOverlay.style.atv';
import { ThemedOverlayComponentProps } from './ThemedOverlay.type';

// Matches the container's close delay before it unmounts the overlay, so the
// fade-out finishes just as the node is removed.
const ANIMATION_DURATION = 250;

type OverlayContentProps = {
  children: ReactNode;
  isOpened: boolean;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  transparent?: boolean;
  contentVisible: boolean;
  useKeyboardAdjustment?: boolean;
  handleModalRequestClose: () => void;
};

// Rendered in-window through a Portal, NOT a native Modal. A RN Modal is a
// separate Android Dialog window, but spatial navigation is fed from
// react-native-keyevent, which only sees the Activity's key events -- inside a
// Dialog the D-Pad never reaches Norigin, so focus can't move between items.
// Mounted only while open, so the focusable registers with a real node ref and
// unregisters on close (restoring focus to the trigger).
function OverlayContent({
  children,
  isOpened,
  style,
  containerStyle,
  contentContainerStyle,
  transparent,
  contentVisible,
  useKeyboardAdjustment,
  handleModalRequestClose,
}: OverlayContentProps) {
  const styles = useThemedStyles(componentStyles);
  const { ref, focusKey, focusSelf } = useFocusable({
    isFocusBoundary: true,
    trackChildren: true,
    autoRestoreFocus: true,
  });

  // Content that arrives after the overlay opens (a lazy `onOpen` fill, an async
  // load) isn't registered yet when the mount effect below claims focus, and
  // Norigin resolves a claim on a childless node to the node itself -- focus
  // parks on the backdrop and nothing looks focused. Re-claim when the content
  // changes, but only while the overlay is still holding focus itself: once a
  // child has it, this must not yank it back.
  useEffect(() => {
    if (getCurrentFocusKey() === focusKey) {
      focusSelf();
    }
  }, [children, focusKey, focusSelf]);

  // Fade in on open; fade out when isOpened flips false. The container keeps the
  // overlay mounted (contentVisible) for ANIMATION_DURATION after close, so the
  // fade-out plays before this node unmounts.
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(isOpened ? 1 : 0, { duration: ANIMATION_DURATION });
  }, [isOpened, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // The overlay is portaled to the page host, so its focus parent is SN:ROOT and
  // norigin's autoRestoreFocus cannot find the way back to the trigger on close --
  // it falls back to the first focusable in the tree instead. Restore focus
  // explicitly: setFocus also cancels the library's pending (debounced)
  // auto-restore that would otherwise target the removed overlay node.
  const restoreFocusKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (restoreFocusKeyRef.current === null) {
      restoreFocusKeyRef.current = getCurrentFocusKey() ?? null;
    }

    focusSelf();
  }, [focusSelf]);

  useEffect(() => () => {
    const restoreFocusKey = restoreFocusKeyRef.current;

    if (restoreFocusKey && doesFocusableExist(restoreFocusKey)) {
      setFocus(restoreFocusKey);
    }
  }, []);

  // A native Modal closed itself on Android BACK (onRequestClose); the Portal
  // does not. Use BackHandler (not the keyevent chain, which doesn't consume the
  // native back) so returning true both closes the overlay and stops the press
  // from reaching the app's "press back again to exit" handler. BackHandler runs
  // listeners LIFO, so this newest one wins. Read the latest close handler from a
  // ref so the subscription stays registered once for the overlay's lifetime.
  const closeRef = useRef(handleModalRequestClose);

  useEffect(() => {
    closeRef.current = handleModalRequestClose;
  }, [handleModalRequestClose]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeRef.current();

      return true;
    });

    return () => subscription.remove();
  }, []);

  return (
    <OverlayScopeProvider>
      <FocusContext.Provider value={ focusKey }>
        <Animated.View style={ [StyleSheet.absoluteFill, animatedStyle] }>
          { /* Backdrop press (touch / air-mouse) closes the overlay; the inner
               Pressable swallows presses on the content so it stays open. */ }
          <Pressable
            ref={ ref }
            onPress={ handleModalRequestClose }
            style={ [styles.modal, !transparent && styles.backdrop, style] }
            tvFocusable={ true }
            focusable={ false }
          >
            <Pressable
              onPress={ noopFn }
              style={ [
                styles.contentContainerStyle,
                containerStyle,
                contentContainerStyle,
              ] }
              tvFocusable={ true }
              focusable={ false }
            >
              { contentVisible && children }
            </Pressable>
            { useKeyboardAdjustment && <KeyboardAdjuster scale={ 0.5 } /> }
          </Pressable>
        </Animated.View>
      </FocusContext.Provider>
    </OverlayScopeProvider>
  );
}

export function ThemedOverlayComponent({
  isOpened,
  containerStyle,
  contentContainerStyle,
  style,
  children,
  transparent,
  contentVisible,
  useKeyboardAdjustment,
  handleModalRequestClose,
  onShow,
}: ThemedOverlayComponentProps) {
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
        containerStyle={ containerStyle }
        contentContainerStyle={ contentContainerStyle }
        transparent={ transparent }
        contentVisible={ contentVisible }
        useKeyboardAdjustment={ useKeyboardAdjustment }
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
