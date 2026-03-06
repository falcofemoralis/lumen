import { useConfigContext } from 'Context/ConfigContext';
import { useOverlayContext } from 'Context/OverlayContext';
import { forwardRef, useId, useImperativeHandle, useState } from 'react';

import ThemedOverlayComponent from './ThemedOverlay.component';
import ThemedOverlayComponentTV from './ThemedOverlay.component.atv';
import { ThemedOverlayContainerProps, ThemedOverlayRef } from './ThemedOverlay.type';

export const ThemedOverlayContainer = forwardRef<ThemedOverlayRef, ThemedOverlayContainerProps>((props, ref) => {
  const [isOpened, setIsOpened] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const { setIsOverlayOpen } = useOverlayContext();
  const { isTV } = useConfigContext();
  const overlayId = useId();

  useImperativeHandle(ref, () => ({
    open: () => {
      setIsOpened(true);
      setContentVisible(true);
      setIsOverlayOpen(overlayId, true);

      setTimeout(() => {
        props.onOpen?.();
      }, 250);
    },
    close: () => {
      setIsOpened(false);
      setIsOverlayOpen(overlayId, false);

      setTimeout(() => {
        setContentVisible(false);
        props.onClose?.();
      }, 250);
    },
  }));

  const handleModalRequestClose = () => {
    setIsOpened(false);
    setIsOverlayOpen(overlayId, false);

    setTimeout(() => {
      setContentVisible(false);
      props.onClose?.();
    }, 250);
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
