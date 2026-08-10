import { doesFocusableExist, getCurrentFocusKey, setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import KeyboardAdjuster from 'Component/KeyboardAdjuster/KeyboardAdjuster.component';
import { Portal } from 'Component/ThemedPortal';
import { OverlayScopeProvider } from 'Context/OverlayContext';
import { useIsScreenFocused } from 'Hooks/useIsScreenFocused';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, ReactNode, RefObject, useEffect, useRef } from 'react';
import { BackHandler, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { noopFn } from 'Util/Function';

import { componentStyles } from './ThemedOverlay.style.atv';
import { ThemedOverlayComponentProps } from './ThemedOverlay.type';

// Matches the container's close delay before it unmounts the overlay, so the
// fade-out finishes just as the node is removed.
const ANIMATION_DURATION = 250;

// Slightly over norigin's own AUTO_RESTORE_FOCUS_DELAY (300ms): the window in
// which a focusable removed elsewhere can still trigger a debounced auto-restore.
const AUTO_RESTORE_SETTLE_DELAY = 350;

// Restore target passed on by an overlay that tore down after another one had
// already taken focus from it -- see the teardown effect below. Module-level
// because the two overlays know nothing about each other: they are separate
// components, portaled as siblings, and the handover happens between the first
// one's unmount and the second one's.
let handedOverRestoreFocusKey: string | null = null;

type OverlayContentProps = {
  children: ReactNode;
  isOpened: boolean;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  transparent?: boolean;
  contentVisible: boolean;
  useKeyboardAdjustment?: boolean;
  isScreenFocused: boolean;
  handleModalRequestClose: () => void;
  preferredChildFocusKey?: string;
  fallbackRestoreFocusKeyRef?: RefObject<string | null>;
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
  isScreenFocused,
  handleModalRequestClose,
  preferredChildFocusKey,
  fallbackRestoreFocusKeyRef,
}: OverlayContentProps) {
  const styles = useThemedStyles(componentStyles);
  // Portaled overlays hang off SN:ROOT, so they stay siblings of every other
  // screen's content. An overlay that is left open under a pushed screen (a
  // category opened from the film's info lists) would keep answering D-Pad
  // presses from the visible screen -- marking it non-focusable drops its whole
  // subtree out of the sibling search, the same way Page does for a covered
  // screen, without unmounting anything.
  const {
    ref,
    focusKey,
    focusSelf,
    focused,
    hasFocusedChild,
  } = useFocusable({
    isFocusBoundary: true,
    trackChildren: true,
    autoRestoreFocus: true,
    focusable: isScreenFocused,
    // Norigin resolves a claim on this node to the child closest to the top-left
    // otherwise -- and setFocus is async, so a child's own autofocus claim can
    // be overridden by the focusSelf below rather than the other way round.
    preferredChildFocusKey,
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

  // Read at teardown time, when the render that lost focus is long committed: the
  // overlay stays mounted for one animation after it closes, which is enough for
  // an overlay opened from its own action to claim focus in the meantime.
  const ownsFocusRef = useRef(false);

  useEffect(() => {
    ownsFocusRef.current = focused || hasFocusedChild;
  }, [focused, hasFocusedChild]);

  // Read at teardown time: an overlay that closes *because* its selection pushed
  // a screen (the film screen's voice selector opening the player) is torn down
  // one animation later, by which point its own screen is already covered.
  const isScreenFocusedRef = useRef(isScreenFocused);

  useEffect(() => {
    isScreenFocusedRef.current = isScreenFocused;
  }, [isScreenFocused]);

  // An overlay can survive a screen push instead of closing (picking a category
  // in the film's info lists keeps the list up, so the user can come back and
  // pick the next one). The pushed screen took focus with it and hands nothing
  // back on the way out: the page's own default-focus targets stay deferred
  // while an overlay is open, so the overlay has to claim focus itself when its
  // screen is on top again. focusSelf resolves to the item focused last.
  const wasScreenFocusedRef = useRef(isScreenFocused);

  useEffect(() => {
    const wasScreenFocused = wasScreenFocusedRef.current;

    wasScreenFocusedRef.current = isScreenFocused;

    let settleTimeout: number | undefined;

    if (isScreenFocused && !wasScreenFocused && isOpened) {
      focusSelf();

      // The screen we came back from unregisters its focusables around now,
      // which makes norigin schedule a debounced auto-restore that would land on
      // whatever it finds first -- behind this overlay. Claim again once that
      // window has passed (a manual setFocus also cancels a pending restore).
      settleTimeout = setTimeout(focusSelf, AUTO_RESTORE_SETTLE_DELAY) as unknown as number;
    }

    return () => clearTimeout(settleTimeout);
  }, [isScreenFocused, isOpened, focusSelf]);

  // Mirrored so the mount-scoped teardown effect below can read the fallback
  // without listing the prop as a dependency -- re-running that effect would
  // fire the restore while the overlay is still up.
  const fallbackRef = useRef(fallbackRestoreFocusKeyRef);

  useEffect(() => {
    fallbackRef.current = fallbackRestoreFocusKeyRef;
  }, [fallbackRestoreFocusKeyRef]);

  useEffect(() => () => {
    const triggerFocusKey = restoreFocusKeyRef.current;
    // This overlay opened while another one was already closing, so the trigger
    // it captured was that overlay's own button -- gone by now. Take over the
    // target the closing overlay handed down instead.
    const inheritedFocusKey = handedOverRestoreFocusKey;

    // The trigger is gone -- the action taken in the overlay removed it (the
    // list item it was opened for). Fall back to wherever the opener said focus
    // should land instead.
    const restoreFocusKey = triggerFocusKey && doesFocusableExist(triggerFocusKey)
      ? triggerFocusKey
      : fallbackRef.current?.current ?? inheritedFocusKey;

    // The trigger stays mounted under the pushed screen, so it is still a valid
    // focus target - but focusing it parks spatial navigation on a screen the
    // user can no longer see, and every following key press drives that hidden
    // screen (ENTER on the covered "watch" button re-opens this very overlay
    // behind the player). The screen on top has claimed focus itself by now.
    if (!isScreenFocusedRef.current) {
      return;
    }

    // Focus already moved on to an overlay opened by this one's own action (the
    // Confirm button of a setting's confirmation opening that setting's value
    // picker): this node is only unmounting now, one animation later. Restoring
    // here would pull focus out of the overlay the user is looking at. Hand the
    // trigger down instead, so closing THAT overlay lands back on it.
    if (!ownsFocusRef.current) {
      handedOverRestoreFocusKey = restoreFocusKey ?? null;

      return;
    }

    if (restoreFocusKey && doesFocusableExist(restoreFocusKey)) {
      setFocus(restoreFocusKey);
    }

    // Cleared only once it has actually been claimed -- an overlay that closed
    // back onto its own trigger (the presets dropdown inside a value picker)
    // must leave the handover for the overlay it is nested in.
    if (restoreFocusKey === inheritedFocusKey) {
      handedOverRestoreFocusKey = null;
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
  preferredChildFocusKey,
  fallbackRestoreFocusKeyRef,
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
        containerStyle={ containerStyle }
        contentContainerStyle={ contentContainerStyle }
        transparent={ transparent }
        contentVisible={ contentVisible }
        useKeyboardAdjustment={ useKeyboardAdjustment }
        isScreenFocused={ isScreenFocused }
        handleModalRequestClose={ handleModalRequestClose }
        preferredChildFocusKey={ preferredChildFocusKey }
        fallbackRestoreFocusKeyRef={ fallbackRestoreFocusKeyRef }
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
