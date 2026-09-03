import { useIsTV } from 'Context/ConfigContext';

import PlayerCDNSelectorComponent from './PlayerCDNSelector.component';
import PlayerCDNSelectorComponentTV from './PlayerCDNSelector.component.atv';
import { PlayerCDNSelectorProps } from './PlayerCDNSelector.type';

export function PlayerCDNSelectorContainer(props: PlayerCDNSelectorProps) {
  const isTV = useIsTV();

  return isTV ? <PlayerCDNSelectorComponentTV { ...props } /> : <PlayerCDNSelectorComponent { ...props } />;
}

export default PlayerCDNSelectorContainer;
