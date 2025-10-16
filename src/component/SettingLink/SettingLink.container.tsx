import { withTV } from 'Hooks/withTV';

import SettingLinkComponent from './SettingLink.component';
import SettingLinkComponentTV from './SettingLink.component.atv';
import { SettingLinkComponentProps } from './SettingLink.type';

export function SettingLinkContainer(props: SettingLinkComponentProps) {
  return withTV(SettingLinkComponentTV, SettingLinkComponent, props);
}

export default SettingLinkContainer;
