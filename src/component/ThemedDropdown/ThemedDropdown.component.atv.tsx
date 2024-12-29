import { Dropdown } from 'react-native-element-dropdown';

import { ThemedDropdownProps } from './ThemedDropdown.type';

export const ThemedDropdownComponentTV = ({
  data,
}: ThemedDropdownProps) => {
  console.log(data);

  return (
    <Dropdown
      data={ data }
      search
      maxHeight={ 300 }
      labelField="label"
      valueField="value"
      onChange={ (value) => console.log(value) }
    />
  );
};

export default ThemedDropdownComponentTV;
