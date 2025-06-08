import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedText from 'Component/ThemedText';
import { useOverlayContext } from 'Context/OverlayContext';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { DefaultFocus, SpatialNavigationFocusableView, SpatialNavigationScrollView } from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';
import { generateId } from 'Util/Math';

import { styles } from './ThemedAccordion.style.atv';
import { AccordionGroupInterface, ThemedAccordionComponentProps } from './ThemedAccordion.type';

export const ThemedAccordionComponent = ({
  data,
  renderItem,
}: ThemedAccordionComponentProps<any>) => {
  const { closeOverlay, openOverlay } = useOverlayContext();
  const overlayId = useRef(generateId());
  const [openAccordionGroup, setOpenAccordionGroup] = useState<string | null>(null);

  const showOverlay = (groupId: string) => {
    setOpenAccordionGroup(groupId);

    openOverlay(overlayId.current);
  };

  const handleCloseOverlay = () => {
    setOpenAccordionGroup(null);

    closeOverlay(overlayId.current);
  };

  const renderAccordionGroup = (group: AccordionGroupInterface<any>) => {
    const { id, title } = group;

    return (
      <View
        key={ `group-${id}` }
        style={ styles.groupContainer }
      >
        <SpatialNavigationFocusableView
          onSelect={ () => showOverlay(id) }
        >
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
        </SpatialNavigationFocusableView>
      </View>
    );
  };

  const renderOverlay = () => {
    const { items = [] } = data.find((group) => group.id === openAccordionGroup) ?? {};

    return (
      <ThemedOverlay
        id={ overlayId.current }
        onHide={ handleCloseOverlay }
        containerStyle={ styles.overlay }
      >
        <SpatialNavigationScrollView
          offsetFromStart={ scale(32) }
        >
          <DefaultFocus>
            <View style={ styles.content }>
              { items.map((subItem, idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <View key={ `sub-item-${idx}` }>
                  { renderItem(subItem, idx) }
                </View>
              )) }
            </View>
          </DefaultFocus>
        </SpatialNavigationScrollView>
      </ThemedOverlay>
    );
  };

  return (
    <View style={ styles.container }>
      { renderOverlay() }
      <DefaultFocus>
        { data.map((group) => renderAccordionGroup(group)) }
      </DefaultFocus>
    </View>
  );
};

export default ThemedAccordionComponent;
