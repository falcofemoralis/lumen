import { withTV } from 'Hooks/withTV';
import { forwardRef, useImperativeHandle, useState } from 'react';

import ThemedOverlayComponent from './ThemedOverlay.component';
import ThemedOverlayComponentTV from './ThemedOverlay.component.atv';
import { ThemedOverlayContainerProps, ThemedOverlayRef } from './ThemedOverlay.type';

export const ThemedOverlayContainer = forwardRef<ThemedOverlayRef, ThemedOverlayContainerProps>((props, ref) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => {
      setIsOpened(true);
      setIsVisible(true);
      props.onOpen?.();
    },
    close: () => {
      setIsOpened(false);
      setIsVisible(false);
      props.onClose?.();
    },
    hide: () => setIsVisible(false),
    show: () => setIsVisible(true),
  }));

  const handleModalRequestClose = () => {
    setIsOpened(false);
    setIsVisible(false);
    props.onClose?.();
  };

  const containerProps = () => ({
    ...props,
    isOpened,
    isVisible,
    handleModalRequestClose,
  });

  return withTV(ThemedOverlayComponentTV, ThemedOverlayComponent, {
    ...containerProps(),
  });
});

export default ThemedOverlayContainer;
