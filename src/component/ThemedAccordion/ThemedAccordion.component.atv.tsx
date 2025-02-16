import ThemedText from 'Component/ThemedText';
import { useState } from 'react';
import { View } from 'react-native';
import { List } from 'react-native-paper';

export const ThemedAccordionComponent = () => {
  const [expanded, setExpanded] = useState(true);

  const handlePress = () => setExpanded(!expanded);

  return (
    <List.AccordionGroup>
      <List.Accordion
        title="Accordion 1"
        id="1"
      >
        <List.Item title="Item 1" />
      </List.Accordion>
      <List.Accordion
        title="Accordion 2"
        id="2"
      >
        <List.Item title="Item 2" />
      </List.Accordion>
      <View>
        <ThemedText>
          List.Accordion can be wrapped because implementation uses React.Context.
        </ThemedText>
        <List.Accordion
          title="Accordion 3"
          id="3"
        >
          <List.Item title="Item 3" />
        </List.Accordion>
      </View>
    </List.AccordionGroup>
  );
};

export default ThemedAccordionComponent;
