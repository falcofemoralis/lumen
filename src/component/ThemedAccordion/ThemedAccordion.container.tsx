import { useConfigContext } from 'Context/ConfigContext';
import { useState } from 'react';

import ThemedAccordionComponent from './ThemedAccordion.component';
import ThemedAccordionComponentTV from './ThemedAccordion.component.atv';
import { ExpandedItem, ThemedAccordionContainerProps } from './ThemedAccordion.type';

export const ThemedAccordionContainer = (props: ThemedAccordionContainerProps<any>) => {
  const [expanded, setExpanded] = useState<ExpandedItem>({});
  const { isTV } = useConfigContext();

  const openAccordionGroup = (id: string) => {
    setExpanded({
      ...expanded,
      [id]: !expanded[id],
    });
  };

  const containerProps = {
    ...props,
    expanded,
    openAccordionGroup,
  };

  // eslint-disable-next-line max-len
  return isTV ? <ThemedAccordionComponentTV { ...containerProps } /> : <ThemedAccordionComponent { ...containerProps } />;

};

export default ThemedAccordionContainer;
