import { useIsFocused } from '@react-navigation/native';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { DefaultFocus, SpatialNavigationScrollView, useLockSpatialNavigation } from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './ThemedAccordion.style.atv';
import { AccordionGroupInterface, ThemedAccordionComponentProps } from './ThemedAccordion.type';

const AccordionLocker = ({ isGroupOpened }: { isGroupOpened: boolean }) => {
  const { lock, unlock } = useLockSpatialNavigation();
  const isFocused = useIsFocused();
  const prevFocus = useRef<boolean>(isFocused);

  useEffect(() => {
    if (isGroupOpened) {
      if (prevFocus.current !== isFocused) {
        prevFocus.current = isFocused;

        if (!isFocused) {
          lock();
        } else {
          unlock();
        }
      }
    }
  }, [isGroupOpened, isFocused, lock, unlock]);

  return null;
};

export const ThemedAccordionComponent = ({
  data,
  overlayContent,
  renderItem,
}: ThemedAccordionComponentProps<any>) => {
  const { scale } = useAppTheme();
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
        <AccordionLocker isGroupOpened={ !!openAccordionGroup } />
        <SpatialNavigationScrollView
          offsetFromStart={ scale(32) }
          style={ overlayContent }
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
