import { withTV } from 'Hooks/withTV';

import SettingBaseComponent from './SettingBase.component';
import SettingBaseComponentTV from './SettingBase.component.atv';
import { SettingBaseComponentProps } from './SettingBase.type';

export function SettingBaseContainer(props: SettingBaseComponentProps) {
  return withTV(SettingBaseComponentTV, SettingBaseComponent, props);
}

export default SettingBaseContainer;
