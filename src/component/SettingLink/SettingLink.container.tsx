import { useConfigContext } from 'Context/ConfigContext';

import SettingLinkComponent from './SettingLink.component';
import SettingLinkComponentTV from './SettingLink.component.atv';
import { SettingLinkComponentProps } from './SettingLink.type';

export function SettingLinkContainer(props: SettingLinkComponentProps) {
  const { isTV } = useConfigContext();

  return isTV ? <SettingLinkComponentTV { ...props } /> : <SettingLinkComponent { ...props } />;

}

export default SettingLinkContainer;
