import { useIsTV } from 'Context/ConfigContext';
import { memo } from 'react';

import ThemedMultiListComponent from './ThemedMultiList.component';
import ThemedMultiListComponentTV from './ThemedMultiList.component.atv';
import { ThemedMultiListContainerProps } from './ThemedMultiList.type';

// Fully controlled: the items are rendered exactly as handed over, so what is on
// screen is whatever the caller last passed. Labels that carry a `(n)` tally are
// the caller's to keep current -- a copy kept here could only be seeded once, and
// went stale the moment the overlay holding it was torn down and remounted.
export function ThemedMultiListContainer({
  data,
  header,
  noItemsTitle,
  noItemsSubtitle,
  searchComponent,
  onChange,
}: ThemedMultiListContainerProps) {
  const isTV = useIsTV();

  const containerProps = {
    values: data,
    header,
    noItemsTitle,
    noItemsSubtitle,
    searchComponent,
    handleOnChange: onChange,
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
