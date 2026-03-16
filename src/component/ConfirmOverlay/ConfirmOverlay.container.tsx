import { useConfigContext } from 'Context/ConfigContext';

import ConfirmOverlayComponent from './ConfirmOverlay.component';
import ConfirmOverlayComponentTV from './ConfirmOverlay.component.atv';
import { ConfirmOverlayProps } from './ConfirmOverlay.type';

export function ConfirmOverlayContainer(props: ConfirmOverlayProps) {
  const { isTV } = useConfigContext();

  return isTV ? <ConfirmOverlayComponentTV { ...props } /> : <ConfirmOverlayComponent { ...props } />;
}

export default ConfirmOverlayContainer;
