import ThemedButton from 'Component/ThemedButton';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedModal from 'Component/ThemedModal';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { useCallback, useRef } from 'react';
import { Text, View } from 'react-native';
import { DefaultFocus, SpatialNavigationFocusableView, SpatialNavigationScrollView } from 'react-tv-space-navigation';
import OverlayStore from 'Store/Overlay.store';
import { scale } from 'Util/CreateStyles';
import { generateId } from 'Util/Math';

import { styles } from './ThemedDropdown.style.atv';
import { DropdownItem, ThemedDropdownProps } from './ThemedDropdown.type';

export const ThemedDropdownComponent = ({
  style,
  data,
  value,
  searchPlaceholder,
  onChange,
}: ThemedDropdownProps) => {
  const id = useRef(generateId());

  const renderHeader = () => {
    if (!searchPlaceholder) {
      return null;
    }

    return (
      <View style={ styles.header }>
        <Text style={ styles.headerText }>
          { searchPlaceholder }
        </Text>
      </View>
    );
  };

  const renderItem = useCallback((item: DropdownItem) => {
    const isSelected = value === item.value;

    return (
      <SpatialNavigationFocusableView
        key={ item.value }
        onSelect={ () => onChange(item) }
      >
        { ({ isFocused }) => (
          <View style={ [
            styles.item,
            isSelected && styles.itemSelected,
            isFocused && styles.itemFocused,
          ] }
          >
            <Text style={ [
              styles.text,
              isSelected && styles.textSelected,
              isFocused && styles.textFocused,
            ] }
            >
              { item.label }
            </Text>
            { isSelected && !isFocused && (
              <ThemedIcon
                style={ styles.iconSelected }
                icon={ {
                  name: 'check',
                  pack: IconPackType.MaterialIcons,
                } }
                size={ scale(16) }
                color="white"
              />
            ) }
          </View>
        ) }
      </SpatialNavigationFocusableView>
    );
  }, [value, onChange]);

  const renderModal = () => (
    <ThemedModal
      id={ id.current }
      onHide={ () => OverlayStore.goToPreviousOverlay() }
      containerStyle={ styles.container }
      contentContainerStyle={ styles.contentContainer }
    >
      { renderHeader() }
      <DefaultFocus>
        <SpatialNavigationScrollView offsetFromStart={ scale(64) }>
          { data.map((item) => renderItem(item)) }
        </SpatialNavigationScrollView>
      </DefaultFocus>
    </ThemedModal>
  );

  const renderInput = () => {
    const selectedLabel = data.find((item) => item.value === value)?.label;

    return (
      <ThemedButton
        style={ [styles.input, style] }
        icon={ {
          name: 'plus',
          pack: IconPackType.Octicons,
        } }
        onPress={ () => OverlayStore.openOverlay(id.current) }
      >
        { selectedLabel }
      </ThemedButton>
    );
  };

  return (
    <View>
      { renderModal() }
      { renderInput() }
    </View>
  );
};

export default ThemedDropdownComponent;
