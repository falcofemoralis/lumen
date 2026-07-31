import { useIsTV } from 'Context/ConfigContext';
import { useOverlayContext } from 'Context/OverlayContext';
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
  // the open/close callbacks are deferred past the animation, so an overlay that
  // unmounts mid-animation would still run them against a gone component
  const animationTimeout = useRef<number | null>(null);

  useEffect(() => () => {
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
    }
  }, []);

  const close = () => {
    setIsOpened(false);
    setIsOverlayOpen(overlayId, false);

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
      setIsOpened(true);
      setContentVisible(true);
      setIsOverlayOpen(overlayId, true);

      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }

      animationTimeout.current = setTimeout(() => {
        animationTimeout.current = null;
        props.onOpen?.();
      }, 250) as unknown as number;
    },
    close,
  }));

  const handleModalRequestClose = () => {
    close();
  };

  const containerProps = {
    ...props,
    isOpened,
    contentVisible,
    handleModalRequestClose,
  };

  return isTV ? <ThemedOverlayComponentTV { ...containerProps } /> : <ThemedOverlayComponent { ...containerProps } />;
});

export default ThemedOverlayContainer;
