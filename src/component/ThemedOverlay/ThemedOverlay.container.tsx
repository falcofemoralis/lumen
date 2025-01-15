import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import OverlayStore from 'Store/Overlay.store';

import ThemedOverlayComponent from './ThemedOverlay.component';
import ThemedOverlayComponentTV from './ThemedOverlay.component.atv';
import { ThemedOverlayContainerProps } from './ThemedOverlay.type';

export function ThemedOverlayContainer({
  id,
  ...props
}: ThemedOverlayContainerProps) {
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

  return withTV(ThemedOverlayComponentTV, ThemedOverlayComponent, {
    ...containerProps(),
  });
}

export default observer(ThemedOverlayContainer);
