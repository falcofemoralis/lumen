import { useIsTV } from 'Context/ConfigContext';
import { memo, useCallback, useState } from 'react';

import ThemedMultiListComponent from './ThemedMultiList.component';
import ThemedMultiListComponentTV from './ThemedMultiList.component.atv';
import { ListItem, ThemedMultiListContainerProps } from './ThemedMultiList.type';

export function ThemedMultiListContainer({
  data,
  header,
  noItemsTitle,
  noItemsSubtitle,
  disableCounter,
  searchComponent,
  onChange,
}: ThemedMultiListContainerProps) {
  const isTV = useIsTV();
  const [countedValues, setCountedValues] = useState<ListItem[]>(data);

  // The counted copy exists only to write the `(n)` tallies into, and it is
  // seeded once -- so while it is in use the caller cannot change what is on
  // screen. With the counter off there is nothing to write, and the items are
  // rendered as handed over, which is what a filtered list needs.
  const values = disableCounter ? data : countedValues;

  const handleOnChange = useCallback((value: string, isChecked: boolean) => {
    onChange(value, isChecked);

    if (disableCounter) {
      return;
    }

    setCountedValues((prevValues) => prevValues.map((item) => {
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
  }, [onChange, disableCounter]);

  const containerProps = {
    values,
    header,
    noItemsTitle,
    noItemsSubtitle,
    searchComponent,
    handleOnChange,
  };

  // eslint-disable-next-line max-len
  return isTV ? <ThemedMultiListComponentTV { ...containerProps } /> : <ThemedMultiListComponent { ...containerProps } />;
}

function propsAreEqual(
  prevProps: ThemedMultiListContainerProps,
  props: ThemedMultiListContainerProps
) {
  return JSON.stringify(prevProps.data) === JSON.stringify(props.data)
    && prevProps.searchComponent === props.searchComponent;
}

export default memo(ThemedMultiListContainer, propsAreEqual);
