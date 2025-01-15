import ThemedButton from 'Component/ThemedButton';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedOverlay from 'Component/ThemedOverlay';
import React, { memo, useCallback, useRef } from 'react';
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
  asOverlay,
  overlayId,
  asList,
  onChange,
}: ThemedDropdownProps) => {
  const id = useRef(overlayId ?? generateId());

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

  const renderItem = useCallback((item: DropdownItem, idx: number) => {
    const isSelected = value === item.value;

    return (
      <DefaultFocus
        key={ `${item.value}-${idx}` }
        enable={ isSelected }
      >
        <SpatialNavigationFocusableView
          onSelect={ () => onChange(item) }
        >
          { ({ isFocused }) => (
            <View style={ [
              styles.item,
              isSelected && styles.itemSelected,
              isFocused && styles.itemFocused,
            ] }
            >
              <View style={ styles.itemContainer }>
                { item.startIcon && (
                  <ThemedImage
                    style={ styles.icon }
                    src={ item.startIcon }
                  />
                ) }
                <Text style={ [
                  styles.text,
                  isSelected && styles.textSelected,
                  isFocused && styles.textFocused,
                ] }
                >
                  { item.label }
                </Text>
                { item.endIcon && (
                  <ThemedImage
                    style={ styles.icon }
                    src={ item.endIcon }
                  />
                ) }
              </View>
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
      </DefaultFocus>
    );
  }, [value, onChange]);

  const renderContent = () => (
    <>
      { renderHeader() }
      <SpatialNavigationScrollView
        offsetFromStart={ scale(64) }
      >
        { data.map((item, index) => renderItem(item, index)) }
      </SpatialNavigationScrollView>
    </>
  );

  const renderModal = () => {
    if (asList) {
      return (
        <View style={ styles.listContainer }>
          <View style={ styles.contentContainer }>
            { renderContent() }
          </View>
        </View>
      );
    }

    return (
      <ThemedOverlay
        id={ id.current }
        onHide={ () => OverlayStore.goToPreviousOverlay() }
        containerStyle={ styles.container }
        contentContainerStyle={ styles.contentContainer }
      >
        { renderContent() }
      </ThemedOverlay>
    );
  };

  const renderInput = () => {
    if (asOverlay || asList) {
      return null;
    }

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

export default memo(ThemedDropdownComponent);
