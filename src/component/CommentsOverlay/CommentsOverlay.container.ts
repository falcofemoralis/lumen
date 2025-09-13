import { withTV } from 'Hooks/withTV';

import CommentsOverlayComponent from './CommentsOverlay.component';
import CommentsOverlayComponentTV from './CommentsOverlay.component.atv';
import { CommentsOverlayContainerProps } from './CommentsOverlay.type';

export function CommentsOverlayContainer(props: CommentsOverlayContainerProps) {
  return withTV(CommentsOverlayComponentTV, CommentsOverlayComponent, props);
}

export default CommentsOverlayContainer;
