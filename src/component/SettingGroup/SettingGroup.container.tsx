import { withTV } from 'Hooks/withTV';

import SettingGroupComponent from './SettingGroup.component';
import SettingGroupComponentTV from './SettingGroup.component.atv';
import { SettingGroupComponentProps } from './SettingGroup.type';

export function SettingGroupContainer(props: SettingGroupComponentProps) {
  return withTV(SettingGroupComponentTV, SettingGroupComponent, props);
}

export default SettingGroupContainer;
