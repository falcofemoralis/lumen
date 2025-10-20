import { withTV } from 'Hooks/withTV';

import SettingTextComponent from './SettingText.component';
import SettingTextComponentTV from './SettingText.component.atv';
import { SettingTextComponentProps } from './SettingText.type';

export function SettingTextContainer(props: SettingTextComponentProps) {
  return withTV(SettingTextComponentTV, SettingTextComponent, props);
}

export default SettingTextContainer;
