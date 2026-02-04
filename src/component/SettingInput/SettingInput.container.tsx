import { useConfigContext } from 'Context/ConfigContext';

import SettingInputComponent from './SettingInput.component';
import SettingInputComponentTV from './SettingInput.component.atv';
import { SettingInputComponentProps } from './SettingInput.type';

export function SettingInputContainer(props: SettingInputComponentProps) {
  const { isTV } = useConfigContext();

  return isTV ? <SettingInputComponentTV { ...props } /> : <SettingInputComponent { ...props } />;

}

export default SettingInputContainer;
