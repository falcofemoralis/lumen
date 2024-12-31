import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import OverlayStore from 'Store/Overlay.store';

import ThemedModalComponent from './ThemedModal.component';
import ThemedModalComponentTV from './ThemedModal.component.atv';
import { ThemedModalContainerProps } from './ThemedModal.type';

export function ThemedModalContainer({
  id,
  ...props
}: ThemedModalContainerProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsOpened(OverlayStore.isOverlayOpened(id));
    setIsVisible(OverlayStore.isOverlayVisible(id));
  }, [OverlayStore.currentOverlay.length]);

  const containerProps = () => ({
    ...props,
    isOpened,
    isVisible,
  });

  return withTV(ThemedModalComponentTV, ThemedModalComponent, {
    ...containerProps(),
  });
}

export default observer(ThemedModalContainer);
