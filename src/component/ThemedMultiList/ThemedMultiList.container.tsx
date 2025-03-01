import { withTV } from 'Hooks/withTV';
import { memo, useState } from 'react';

import ThemedMultiListComponent from './ThemedMultiList.component';
import ThemedMultiListComponentTV from './ThemedMultiList.component.atv';
import { ListItem, ThemedMultiListContainerProps } from './ThemedMultiList.type';

export function ThemedMultiListContainer({
  data,
  header,
  onChange,
}: ThemedMultiListContainerProps) {
  const [values, setValues] = useState<ListItem[]>(data);

  const handleOnChange = (value: string, isChecked: boolean) => {
    onChange(value, isChecked);

    setValues(values.map((item) => {
      if (item.value === value) {
        return {
          ...item,
          isChecked,
        };
      }

      return item;
    }));
  };

  return withTV(ThemedMultiListComponentTV, ThemedMultiListComponent, {
    values,
    header,
    handleOnChange,
  });
}

function propsAreEqual(
  prevProps: ThemedMultiListContainerProps,
  props: ThemedMultiListContainerProps,
) {
  return JSON.stringify(prevProps.data) === JSON.stringify(props.data);
}

export default memo(ThemedMultiListContainer, propsAreEqual);
