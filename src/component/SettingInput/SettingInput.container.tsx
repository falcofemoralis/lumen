import { withTV } from 'Hooks/withTV';

import SettingInputComponent from './SettingInput.component';
import SettingInputComponentTV from './SettingInput.component.atv';
import { SettingInputComponentProps } from './SettingInput.type';

export function SettingInputContainer(props: SettingInputComponentProps) {
  return withTV(SettingInputComponentTV, SettingInputComponent, props);
}

export default SettingInputContainer;
