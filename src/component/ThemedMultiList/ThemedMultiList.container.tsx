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
        const labelMatch = item.label.match(/(.*?)\((\d+)\)$/);
        const label = labelMatch ? labelMatch[1] : item.label;
        const number = labelMatch ? parseInt(labelMatch[2], 10) : 0;

        return {
          ...item,
          isChecked,
          label: `${label}(${isChecked ? number + 1 : number - 1})`,
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
  props: ThemedMultiListContainerProps
) {
  return JSON.stringify(prevProps.data) === JSON.stringify(props.data);
}

export default memo(ThemedMultiListContainer, propsAreEqual);
