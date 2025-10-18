import { withTV } from 'Hooks/withTV';

import SettingSelectComponent from './SettingSelect.component';
import SettingSelectComponentTV from './SettingSelect.component.atv';
import { SettingSelectComponentProps } from './SettingSelect.type';

export function SettingSelectContainer(props: SettingSelectComponentProps) {
  return withTV(SettingSelectComponentTV, SettingSelectComponent, props);
}

export default SettingSelectContainer;
