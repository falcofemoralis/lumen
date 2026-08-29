import { SettingBase } from 'Component/SettingBase';
import { memo } from 'react';

import { SettingTextComponentProps } from './SettingText.type';

export const SettingTextComponent = memo((props: SettingTextComponentProps) => (
  <SettingBase { ...props } />
));

export default SettingTextComponent;
