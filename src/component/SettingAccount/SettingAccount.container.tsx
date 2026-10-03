import { useIsTV } from 'Context/ConfigContext';

import SettingAccountComponent from './SettingAccount.component';
import SettingAccountComponentTV from './SettingAccount.component.atv';
import { SettingAccountComponentProps } from './SettingAccount.type';

export function SettingAccountContainer(props: SettingAccountComponentProps) {
  const isTV = useIsTV();

  return isTV ? <SettingAccountComponentTV { ...props } /> : <SettingAccountComponent { ...props } />;
}

export default SettingAccountContainer;
