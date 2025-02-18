import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedText from 'Component/ThemedText';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { DefaultFocus, SpatialNavigationFocusableView, SpatialNavigationScrollView } from 'react-tv-space-navigation';
import OverlayStore from 'Store/Overlay.store';
import { scale } from 'Util/CreateStyles';
import { generateId } from 'Util/Math';

import { styles } from './ThemedAccordion.style.atv';
import { AccordionGroup, ThemedAccordionComponentProps } from './ThemedAccordion.type';

export const ThemedAccordionComponent = ({
  data,
  renderItem,
}: ThemedAccordionComponentProps<any>) => {
  const overlayId = useRef(generateId());
  const [openAccordionGroup, setOpenAccordionGroup] = useState<string | null>(null);

  const openOverlay = (groupId: string) => {
    setOpenAccordionGroup(groupId);

    OverlayStore.openOverlay(overlayId.current);
  };

  const closeOverlay = () => {
    setOpenAccordionGroup(null);

    OverlayStore.closeOverlay(overlayId.current);
  };

  const renderAccordionGroup = (group: AccordionGroup<any>) => {
    const { id, title } = group;

    return (
      <View key={ id }>
        <SpatialNavigationFocusableView
          style={ {
            padding: 20,
          } }
          onSelect={ () => openOverlay(id) }
        >
          { ({ isFocused }) => (
            <ThemedText
              style={ isFocused && styles.groupFocused }
            >
              { title }
            </ThemedText>
          ) }
        </SpatialNavigationFocusableView>
      </View>
    );
  };

  const renderOverlay = () => {
    const { items = [] } = data.find((group) => group.id === openAccordionGroup) ?? {};

    return (
      <ThemedOverlay
        id={ overlayId.current }
        onHide={ closeOverlay }
      >
        <SpatialNavigationScrollView
          offsetFromStart={ scale(32) }
        >
          <DefaultFocus>
            <View style={ styles.content }>
              { items.map((subItem, idx) => renderItem(subItem, idx)) }
            </View>
          </DefaultFocus>
        </SpatialNavigationScrollView>
      </ThemedOverlay>
    );
  };

  return (
    <View style={ styles.container }>
      { renderOverlay() }
      { data.map((group) => renderAccordionGroup(group)) }
    </View>
  );
};

export default ThemedAccordionComponent;
