import { useConfigContext } from 'Context/ConfigContext';

import SettingsStructureComponent from './SettingsStructure.component';
import SettingsStructureComponentTV from './SettingsStructure.component.atv';
import { SettingsStructureComponentProps } from './SettingsStructure.type';

export function SettingsStructureContainer(props: SettingsStructureComponentProps) {
  const { isTV } = useConfigContext();

  return isTV ? <SettingsStructureComponentTV { ...props } /> : <SettingsStructureComponent { ...props } />;

}

export default SettingsStructureContainer;
