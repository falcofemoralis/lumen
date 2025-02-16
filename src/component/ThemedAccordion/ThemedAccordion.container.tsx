import { withTV } from 'Hooks/withTV';
import { useState } from 'react';

import ThemedAccordionComponent from './ThemedAccordion.component';
import ThemedAccordionComponentTV from './ThemedAccordion.component.atv';
import { ExpandedItem, ThemedAccordionContainerProps } from './ThemedAccordion.type';

export const ThemedAccordionContainer = (props: ThemedAccordionContainerProps<any>) => {
  const [expanded, setExpanded] = useState<ExpandedItem>({});

  const openAccordionGroup = (id: string) => {
    setExpanded({
      ...expanded,
      [id]: !expanded[id],
    });
  };

  const containerFunctions = {
    openAccordionGroup,
  };

  const containerProps = {
    ...props,
    expanded,
  };

  return withTV(ThemedAccordionComponentTV, ThemedAccordionComponent, {
    ...containerProps,
    ...containerFunctions,
  });
};

export default ThemedAccordionContainer;
