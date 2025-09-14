import { withTV } from 'Hooks/withTV';
import { forwardRef, useImperativeHandle, useState } from 'react';

import ThemedOverlayComponent from './ThemedOverlay.component';
import ThemedOverlayComponentTV from './ThemedOverlay.component.atv';
import { ThemedOverlayContainerProps, ThemedOverlayRef } from './ThemedOverlay.type';

export const ThemedOverlayContainer = forwardRef<ThemedOverlayRef, ThemedOverlayContainerProps>((props, ref) => {
  const [isOpened, setIsOpened] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => {
      setIsOpened(true);
      setContentVisible(true);

      setTimeout(() => {
        props.onOpen?.();
      }, 250);
    },
    close: () => {
      setIsOpened(false);

      setTimeout(() => {
        setContentVisible(false);
        props.onClose?.();
      }, 250);
    },
  }));

  const handleModalRequestClose = () => {
    setIsOpened(false);

    setTimeout(() => {
      setContentVisible(false);
      props.onClose?.();
    }, 250);
  };

  const containerProps = () => ({
    ...props,
    isOpened,
    contentVisible,
    handleModalRequestClose,
  });

  return withTV(ThemedOverlayComponentTV, ThemedOverlayComponent, {
    ...containerProps(),
  });
});

export default ThemedOverlayContainer;
