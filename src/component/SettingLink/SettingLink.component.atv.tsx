import SettingBase from 'Component/SettingBase';
import { propsAreEqual } from 'Component/SettingBase/SettingBase.component.atv';
import { memo } from 'react';

import { SettingLinkComponentProps } from './SettingLink.type';

export const SettingLinkComponent = memo(({
  setting,
  onUpdate,
}: SettingLinkComponentProps) => (
  <SettingBase
    setting={ setting }
    onPress={ () => onUpdate(setting, '') }
  />
), propsAreEqual);

export default SettingLinkComponent;