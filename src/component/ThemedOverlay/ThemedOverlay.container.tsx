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
    const opened = OverlayStore.isOverlayOpened(id);
    const visible = OverlayStore.isOverlayVisible(id);

    if (opened !== isOpened) {
      setIsOpened(opened);
    }

    if (visible !== isVisible) {
      setIsVisible(visible);
    }
  }, [OverlayStore.currentOverlay.length]);

  const containerProps = () => ({
    ...props,
    isOpened,
    isVisible,
    id,
  });

  return withTV(ThemedOverlayComponentTV, ThemedOverlayComponent, {
    ...containerProps(),
  });
}

export default observer(ThemedOverlayContainer);
