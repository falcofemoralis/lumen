import { useConfigContext } from 'Context/ConfigContext';

import SettingSelectComponent from './SettingSelect.component';
import SettingSelectComponentTV from './SettingSelect.component.atv';
import { SettingSelectComponentProps } from './SettingSelect.type';

export function SettingSelectContainer(props: SettingSelectComponentProps) {
  const { isTV } = useConfigContext();

  return isTV ? <SettingSelectComponentTV { ...props } /> : <SettingSelectComponent { ...props } />;
}

export default SettingSelectContainer;
