import { useConfigContext } from 'Context/ConfigContext';

import SettingBaseComponent from './SettingBase.component';
import SettingBaseComponentTV from './SettingBase.component.atv';
import { SettingBaseComponentProps } from './SettingBase.type';

export function SettingBaseContainer(props: SettingBaseComponentProps) {
  const { isTV } = useConfigContext();

  return isTV ? <SettingBaseComponentTV { ...props } /> : <SettingBaseComponent { ...props } />;
}

export default SettingBaseContainer;
