import { useConfigContext } from 'Context/ConfigContext';

import SettingTextComponent from './SettingText.component';
import SettingTextComponentTV from './SettingText.component.atv';
import { SettingTextComponentProps } from './SettingText.type';

export function SettingTextContainer(props: SettingTextComponentProps) {
  const { isTV } = useConfigContext();

  return isTV ? <SettingTextComponentTV { ...props } /> : <SettingTextComponent { ...props } />;
}

export default SettingTextContainer;
