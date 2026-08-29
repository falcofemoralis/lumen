import { useIsTV } from 'Context/ConfigContext';
import { useOverlayContext } from 'Context/OverlayContext';
import { useIsScreenFocused } from 'Hooks/useIsScreenFocused';
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import ThemedOverlayComponent from './ThemedOverlay.component';
import ThemedOverlayComponentTV from './ThemedOverlay.component.atv';
import { ThemedOverlayContainerProps, ThemedOverlayRef } from './ThemedOverlay.type';

export const ThemedOverlayContainer = forwardRef<ThemedOverlayRef, ThemedOverlayContainerProps>((props, ref) => {
  const [isOpened, setIsOpened] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const { setIsOverlayOpen } = useOverlayContext();
  const isTV = useIsTV();
  const overlayId = useId();
  const isScreenFocused = useIsScreenFocused();
  // the open/close callbacks are deferred past the animation, so an overlay that
  // unmounts mid-animation would still run them against a gone component
  const animationTimeout = useRef<number | null>(null);
  // where focus should go on close when the node that opened the overlay is gone
  const fallbackRestoreFocusKeyRef = useRef<string | null>(null);

  useEffect(() => () => {
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
    }
  }, []);

  // The flag is app-wide: it holds back everyone else's default focus claims
  // while an overlay owns focus. An overlay whose screen is no longer on top
  // does NOT own focus anymore -- the pushed screen does -- so it must stop
  // gating. That is what lets a screen opened FROM an overlay (a category picked
  // in the film's info lists) focus its own content while the overlay stays open
  // underneath, ready for the user to come back and pick the next one.
  useEffect(() => {
    setIsOverlayOpen(overlayId, isOpened && isScreenFocused);
  }, [isOpened, isScreenFocused, overlayId, setIsOverlayOpen]);

  // An overlay unmounted while still open would otherwise leave the flag stuck
  // on for the rest of the session.
  useEffect(() => () => setIsOverlayOpen(overlayId, false), [overlayId, setIsOverlayOpen]);

  const close = () => {
    setIsOpened(false);

    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
    }

    animationTimeout.current = setTimeout(() => {
      animationTimeout.current = null;
      setContentVisible(false);
      props.onClose?.();
    }, 250) as unknown as number;
  };

  useImperativeHandle(ref, () => ({
    open: () => {
      // a leftover fallback from the previous open would send focus somewhere
      // unrelated to what opened the overlay this time
      fallbackRestoreFocusKeyRef.current = null;
      setIsOpened(true);
      setContentVisible(true);

      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }

      animationTimeout.current = setTimeout(() => {
        animationTimeout.current = null;
        props.onOpen?.();
      }, 250) as unknown as number;
    },
    close,
    setFallbackRestoreFocusKey: (focusKey: string | null) => {
      fallbackRestoreFocusKeyRef.current = focusKey;
    },
  }));

  const handleModalRequestClose = () => {
    close();
  };

  const containerProps = {
    ...props,
    isOpened,
    contentVisible,
    handleModalRequestClose,
    fallbackRestoreFocusKeyRef,
  };

  return isTV ? <ThemedOverlayComponentTV { ...containerProps } /> : <ThemedOverlayComponent { ...containerProps } />;
});

export default ThemedOverlayContainer;
