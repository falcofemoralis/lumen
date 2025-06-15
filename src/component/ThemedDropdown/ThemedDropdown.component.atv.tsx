import ThemedButton from 'Component/ThemedButton';
import ThemedImage from 'Component/ThemedImage';
import ThemedOverlay from 'Component/ThemedOverlay';
import { useOverlayContext } from 'Context/OverlayContext';
import { Plus } from 'lucide-react-native';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationVirtualizedList,
  SpatialNavigationVirtualizedListRef,
} from 'react-tv-space-navigation';
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
  const { openOverlay, goToPreviousOverlay } = useOverlayContext();
  const overlayId = useRef(overlayIdProp ?? generateId());
  const scrollViewRef = useRef<SpatialNavigationVirtualizedListRef>(null);

  useEffect(() => {
    const itemIdx = data.findIndex((item) => item.value === value);

    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.focus(itemIdx);
      }, 0);
    }
  }, [data, value]);

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
      <DefaultFocus enable={ isSelected }>
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
            </View>
          ) }
        </SpatialNavigationFocusableView>
      </DefaultFocus>
    );
  }, [value, onChange]);

  const renderList = () => (
    <View
      style={ styles.scrollViewContainer }
    >
      <SpatialNavigationVirtualizedList
        ref={ scrollViewRef }
        style={ styles.scrollView }
        data={ data }
        renderItem={ renderItem }
        itemSize={ styles.item.height }
        orientation="vertical"
        scrollBehavior='stick-to-center'
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
        onHide={ () => goToPreviousOverlay() }
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
        IconComponent={ Plus }
        onPress={ () => openOverlay(overlayId.current) }
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
