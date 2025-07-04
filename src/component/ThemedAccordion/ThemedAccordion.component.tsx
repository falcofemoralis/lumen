import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import { View } from 'react-native';
import Expandable from 'react-native-reanimated-animated-accordion';

import { styles } from './ThemedAccordion.style';
import { AccordionGroupInterface, ThemedAccordionComponentProps } from './ThemedAccordion.type';

export const ThemedAccordionComponent = ({
  expanded,
  data,
  openAccordionGroup,
  renderItem,
}: ThemedAccordionComponentProps<any>) => {
  const renderAccordionGroup = (group: AccordionGroupInterface<any>) => {
    const { id, title, items } = group;

    return (
      <View key={ id }>
        <ThemedPressable
          style={ styles.button }
          contentStyle={ styles.buttonContent }
          onPress={ () => openAccordionGroup(id) }
        >
          <ThemedText>{ title }</ThemedText>
        </ThemedPressable>
        <Expandable
          expanded={ expanded[id] }
        >
          { items.map((subItem, idx) => renderItem(subItem, idx)) }
        </Expandable>
      </View>
    );
  };

  return (
    <View>
      { data.map((group) => renderAccordionGroup(group)) }
    </View>
  );
};

export default ThemedAccordionComponent;
