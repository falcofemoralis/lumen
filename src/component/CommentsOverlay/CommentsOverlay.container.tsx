import { useConfigContext } from 'Context/ConfigContext';

import CommentsOverlayComponent from './CommentsOverlay.component';
import CommentsOverlayComponentTV from './CommentsOverlay.component.atv';
import { CommentsOverlayContainerProps } from './CommentsOverlay.type';

export function CommentsOverlayContainer(props: CommentsOverlayContainerProps) {
  const { isTV } = useConfigContext();

  return isTV ? <CommentsOverlayComponentTV { ...props } /> : <CommentsOverlayComponent { ...props } />;
}

export default CommentsOverlayContainer;
