import { withTV } from 'Hooks/withTV';

import SettingsStructureComponent from './SettingsStructure.component';
import SettingsStructureComponentTV from './SettingsStructure.component.atv';
import { SettingsStructureComponentProps } from './SettingsStructure.type';

export function SettingsStructureContainer(props: SettingsStructureComponentProps) {
  return withTV(SettingsStructureComponentTV, SettingsStructureComponent, props);
}

export default SettingsStructureContainer;
