import { useOverlayContext } from 'Context/OverlayContext';
import { withTV } from 'Hooks/withTV';
import { useEffect, useState } from 'react';

import ThemedOverlayComponent from './ThemedOverlay.component';
import ThemedOverlayComponentTV from './ThemedOverlay.component.atv';
import { ThemedOverlayContainerProps } from './ThemedOverlay.type';

export function ThemedOverlayContainer({
  id,
  ...props
}: ThemedOverlayContainerProps) {
  const { currentOverlay, isOverlayOpened, isOverlayVisible } = useOverlayContext();
  const [isOpened, setIsOpened] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const opened = isOverlayOpened(id);
    const visible = isOverlayVisible(id);

    if (opened !== isOpened) {
      setIsOpened(opened);
    }

    if (visible !== isVisible) {
      setIsVisible(visible);
    }
  }, [currentOverlay.length]);

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

export default ThemedOverlayContainer;
