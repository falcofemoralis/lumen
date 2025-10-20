import SettingBase from 'Component/SettingBase';

import { SettingTextComponentProps } from './SettingText.type';

export const SettingTextComponent = ({
  setting,
  onUpdate,
}: SettingTextComponentProps) => <SettingBase setting={ setting } onPress={ () => onUpdate(setting, '') } />;

export default SettingTextComponent;