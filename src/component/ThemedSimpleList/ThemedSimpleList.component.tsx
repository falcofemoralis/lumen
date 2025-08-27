import ThemedImage from 'Component/ThemedImage';
import ThemedList from 'Component/ThemedList';
import { ThemedListRef } from 'Component/ThemedList/ThemedList.type';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import { useLandscape } from 'Hooks/useLandscape';
import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { ITEM_HEIGHT, styles } from './ThemedSimpleList.style';
import { ListItem, ThemedSimpleListComponentProps } from './ThemedSimpleList.type';

export const ThemedListComponent = ({
  data,
  header,
  value,
  style,
  onChange,
}: ThemedSimpleListComponentProps) => {
  const listRef = useRef<ThemedListRef>(null);
  const isLandscape = useLandscape();

  useEffect(() => {
    setTimeout(() => {
      const itemIdx = data.findIndex((item) => item.value === value);

      if (itemIdx <= 5) {
        return;
      }

      listRef.current?.scrollTo(itemIdx);
    }, 0);
  }, [value]);

  const renderHeader = () => {
    if (!header) {
      return null;
    }

    return (
      <View style={ styles.header }>
        <ThemedText style={ styles.headerText }>
          { header }
        </ThemedText>
      </View>
    );
  };

  const renderItem = useCallback(({ item }: { item: ListItem }) => (
    <ThemedPressable
      key={ item.value }
      onPress={ () => { onChange(item); } }
      style={ styles.listItem }
      contentStyle={ [styles.listItemContent, item.value === value && styles.listItemSelected] }
    >
      <View style={ styles.item }>
        { item.startIcon && (
          <ThemedImage
            style={ styles.icon }
            src={ item.startIcon }
          />
        ) }
        <ThemedText style={ styles.itemLabel }>
          { item.label }
        </ThemedText>
        { item.endIcon && (
          <ThemedImage
            style={ styles.icon }
            src={ item.endIcon }
          />
        ) }
      </View>
    </ThemedPressable>
  ), [onChange, value]);

  const renderList = () => (
    <View
      style={ [
        styles.listItems,
        isLandscape && styles.listItemsLandscape,
      ] }
    >
      <ThemedList
        ref={ listRef }
        data={ data }
        renderItem={ renderItem }
        estimatedItemSize={ scale(ITEM_HEIGHT) }
      />
    </View>
  );

  const renderContent = () => (
    <>
      { renderHeader() }
      { renderList() }
    </>
  );

  return (
    <View style={ [styles.listContainer, style] }>
      { renderContent() }
    </View>
  );
};

export default ThemedListComponent;
