import { useConfigContext } from 'Context/ConfigContext';

import SettingGroupComponent from './SettingGroup.component';
import SettingGroupComponentTV from './SettingGroup.component.atv';
import { SettingGroupComponentProps } from './SettingGroup.type';

export function SettingGroupContainer(props: SettingGroupComponentProps) {
  const { isTV } = useConfigContext();

  return isTV ? <SettingGroupComponentTV { ...props } /> : <SettingGroupComponent { ...props } />;
}

export default SettingGroupContainer;
