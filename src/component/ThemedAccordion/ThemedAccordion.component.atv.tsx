import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useRef, useState } from 'react';
import { View } from 'react-native';

import { componentStyles } from './ThemedAccordion.style.atv';
import { AccordionGroupInterface, ThemedAccordionComponentProps } from './ThemedAccordion.type';

export const ThemedAccordionComponent = ({
  data,
  overlayContentStyle,
  renderItem,
}: ThemedAccordionComponentProps<any>) => {
  const styles = useThemedStyles(componentStyles);
  const overlayRef = useRef<ThemedOverlayRef>(null);
  const [openAccordionGroup, setOpenAccordionGroup] = useState<string | null>(null);

  const showOverlay = (groupId: string) => {
    setOpenAccordionGroup(groupId);

    overlayRef.current?.open();
  };

  const handleCloseOverlay = () => {
    setTimeout(() => {
      setOpenAccordionGroup(null);
    }, 250);
  };

  const renderAccordionGroup = (group: AccordionGroupInterface<any>) => {
    const { id, title } = group;

    return (
      <View
        key={ `group-${id}` }
        style={ styles.groupContainer }
      >
        <ThemedPressable onPress={ () => showOverlay(id) }>
          { ({ isFocused }) => (
            <ThemedText
              style={ [
                styles.group,
                isFocused && styles.groupFocused,
              ] }
            >
              { title }
            </ThemedText>
          ) }
        </ThemedPressable>
      </View>
    );
  };

  const renderOverlay = () => {
    const { items = [] } = data.find((group) => group.id === openAccordionGroup) ?? {};

    return (
      <ThemedOverlay
        ref={ overlayRef }
        containerStyle={ styles.overlay }
        onClose={ handleCloseOverlay }
      >
        <ThemedScrollView style={ overlayContentStyle }>
          <View style={ styles.content }>
            { items.map((subItem, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <View key={ `sub-item-${idx}` }>
                { renderItem(subItem, idx) }
              </View>
            )) }
          </View>
        </ThemedScrollView>
      </ThemedOverlay>
    );
  };

  return (
    <View style={ styles.container }>
      { renderOverlay() }
      <ThemedScrollView containerStyle={ styles.itemsContainer }>
        { data.map((group) => renderAccordionGroup(group)) }
      </ThemedScrollView>
    </View>
  );
};

export default ThemedAccordionComponent;
