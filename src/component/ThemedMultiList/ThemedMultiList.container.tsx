import { useConfigContext } from 'Context/ConfigContext';
import { memo, useCallback, useState } from 'react';

import ThemedMultiListComponent from './ThemedMultiList.component';
import ThemedMultiListComponentTV from './ThemedMultiList.component.atv';
import { ListItem, ThemedMultiListContainerProps } from './ThemedMultiList.type';

export function ThemedMultiListContainer({
  data,
  header,
  noItemsTitle,
  noItemsSubtitle,
  onChange,
}: ThemedMultiListContainerProps) {
  const { isTV } = useConfigContext();
  const [values, setValues] = useState<ListItem[]>(data);

  const handleOnChange = useCallback((value: string, isChecked: boolean) => {
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
  }, [onChange, values]);

  const containerProps = {
    values,
    header,
    noItemsTitle,
    noItemsSubtitle,
    handleOnChange,
  };

  // eslint-disable-next-line max-len
  return isTV ? <ThemedMultiListComponentTV { ...containerProps } /> : <ThemedMultiListComponent { ...containerProps } />;
}

function propsAreEqual(
  prevProps: ThemedMultiListContainerProps,
  props: ThemedMultiListContainerProps
) {
  return JSON.stringify(prevProps.data) === JSON.stringify(props.data);
}

export default memo(ThemedMultiListContainer, propsAreEqual);
