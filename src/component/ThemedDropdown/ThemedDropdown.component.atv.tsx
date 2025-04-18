import ThemedButton from 'Component/ThemedButton';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedOverlay from 'Component/ThemedOverlay';
import React, { memo, useCallback, useRef } from 'react';
import { Text, View } from 'react-native';
import {
  SpatialNavigationFocusableView,
  SpatialNavigationVirtualizedList,
  SpatialNavigationVirtualizedListRef,
} from 'react-tv-space-navigation';
import OverlayStore from 'Store/Overlay.store';
import { scale } from 'Util/CreateStyles';
import { generateId } from 'Util/Math';

import { styles } from './ThemedDropdown.style.atv';
import { DropdownItem, ThemedDropdownComponentProps } from './ThemedDropdown.type';

export const ThemedDropdownComponent = ({
  inputStyle,
  data,
  value,
  header,
  asOverlay,
  overlayId: overlayIdProp,
  asList,
  style,
  onChange,
}: ThemedDropdownComponentProps) => {
  const overlayId = useRef(overlayIdProp ?? generateId());
  const scrollViewRef = useRef<SpatialNavigationVirtualizedListRef>(null);

  const handleLayout = () => {
    const itemIdx = data.findIndex((item) => item.value === value);

    if (scrollViewRef.current) {
      scrollViewRef.current.focus(itemIdx);
    }
  };

  const renderHeader = () => {
    if (!header) {
      return null;
    }

    return (
      <View style={ styles.header }>
        <Text style={ styles.headerText }>
          { header }
        </Text>
      </View>
    );
  };

  const renderItem = useCallback(({ item }: { item: DropdownItem }) => {
    const isSelected = value === item.value;

    return (
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
    );
  }, [value, onChange]);

  const renderList = () => (
    <View
      style={ styles.scrollViewContainer }
      onLayout={ handleLayout }
    >
      <SpatialNavigationVirtualizedList
        ref={ scrollViewRef }
        style={ styles.scrollView }
        data={ data }
        renderItem={ renderItem }
        itemSize={ styles.item.height }
        orientation="vertical"
        scrollBehavior="stick-to-end"
      />
    </View>
  );

  const renderContent = () => (
    <>
      { renderHeader() }
      { renderList() }
    </>
  );

  const renderModal = () => {
    if (asList) {
      return (
        <View style={ styles.listContainer }>
          { renderContent() }
        </View>
      );
    }

    return (
      <ThemedOverlay
        id={ overlayId.current }
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

    const { label, endIcon } = data.find((item) => item.value === value) ?? {};

    return (
      <ThemedButton
        style={ [styles.input, inputStyle] }
        rightImageStyle={ styles.inputImage }
        icon={ {
          name: 'plus',
          pack: IconPackType.Octicons,
        } }
        onPress={ () => OverlayStore.openOverlay(overlayId.current) }
        rightImage={ endIcon }
      >
        { label }
      </ThemedButton>
    );
  };

  return (
    <View style={ style }>
      { renderModal() }
      { renderInput() }
    </View>
  );
};

export default memo(ThemedDropdownComponent);
