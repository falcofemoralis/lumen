import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useLandscape } from 'Hooks/useLandscape';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useCallback, useRef } from 'react';
import { ScrollView, View } from 'react-native';

import { componentStyles } from './ThemedSimpleList.style';
import { ListItem, ThemedSimpleListComponentProps } from './ThemedSimpleList.type';

export const ThemedListComponent = ({
  data,
  header,
  value,
  style,
  onChange,
}: ThemedSimpleListComponentProps) => {
  const styles = useThemedStyles(componentStyles);
  const scrollViewRef = useRef<ScrollView>(null);
  const isLandscape = useLandscape();

  const handleLayout = () => {
    const itemIdx = data.findIndex((item) => item.value === value);

    if (itemIdx <= 5) {
      return;
    }

    const scrollIndex = itemIdx + 2;

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: scrollIndex * styles.item.height, animated: false });
    }
  };

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
  ), [onChange, value, styles]);

  const renderList = () => (
    <View
      style={ [
        styles.listItems,
        isLandscape && styles.listItemsLandscape,
      ] }
    >
      <ScrollView
        ref={ scrollViewRef }
        onLayout={ handleLayout }
      >
        { data.map((item) => renderItem({ item })) }
      </ScrollView>
    </View>
  );

  return (
    <View style={ [styles.listContainer, style] }>
      { renderHeader() }
      { renderList() }
    </View>
  );
};

export default ThemedListComponent;
