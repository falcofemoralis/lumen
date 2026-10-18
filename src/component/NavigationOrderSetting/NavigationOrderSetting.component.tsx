import { Header } from 'Component/Header';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { ThemedText } from 'Component/ThemedText';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ChevronUp from 'lucide-react-native/icons/chevron-up';
import Eye from 'lucide-react-native/icons/eye';
import EyeOff from 'lucide-react-native/icons/eye-off';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from 'Hooks/useThemedStyles';

import { componentStyles } from './NavigationOrderSetting.style';
import { NavigationOrderItem, NavigationOrderSettingProps } from './NavigationOrderSetting.type';

const NavigationOrderSettingComponent = ({
  title,
  items,
  value,
  hiddenItems,
  onChange,
  onHiddenItemsChange,
  onBack,
  embedded = false,
}: NavigationOrderSettingProps) => {
  const styles = useThemedStyles(componentStyles);
  const iconSizeStyle = useMemo(() => ({
    width: styles.buttonIcon.width, height: styles.buttonIcon.height, flexShrink: 0,
  }), [styles]);

  const orderedItems = useMemo(() => {
    const itemsByValue = new Map(items.map(item => [item.value, item]));
    const result: NavigationOrderItem[] = [];
    const seen = new Set<string>();

    value.forEach(itemValue => {
      const item = itemsByValue.get(itemValue);

      if (!item || seen.has(itemValue)) {
        return;
      }

      seen.add(itemValue);
      result.push(item);
    });

    items.forEach(item => {
      if (!seen.has(item.value)) {
        seen.add(item.value);
        result.push(item);
      }
    });

    return result;
  }, [items, value]);

  const moveItem = useCallback((index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= orderedItems.length) {
      return;
    }

    const next = orderedItems.map(item => item.value);

    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

    onChange(next);
  }, [onChange, orderedItems]);

  const toggleItemVisibility = useCallback((itemValue: string) => {
    const isHidden = hiddenItems.includes(itemValue);
    const visibleCount = orderedItems.length - hiddenItems.filter(value =>
      orderedItems.some(item => item.value === value)
    ).length;

    if (!isHidden && visibleCount <= 1) {
      return;
    }

    onHiddenItemsChange(
      isHidden
        ? hiddenItems.filter(value => value !== itemValue)
        : [...hiddenItems, itemValue],
    );
  }, [hiddenItems, onHiddenItemsChange, orderedItems]);

  const list = (
        <ThemedScrollView
          contentContainerStyle={ styles.container }
          containerStyle={ embedded ? { flex: 1, height: undefined, minHeight: 0 } : undefined }
          autofocus={ !embedded }
        >
          { orderedItems.map((item, index) => {
            const { IconComponent } = item;

            return (
              <View
                key={ item.value }
                style={ styles.item }
              >
                <View style={ styles.itemContent }>
                  <IconComponent
                    style={ styles.itemIcon }
                    size={ styles.itemIcon.width }
                  />

                  <ThemedText style={ styles.label }>
                    { item.label }
                  </ThemedText>
                </View>

                <View style={ styles.actions }>
                  <ThemedButton
                    disabled={ !hiddenItems.includes(item.value) && orderedItems.filter(orderedItem => !hiddenItems.includes(orderedItem.value)).length <= 1 }
                    style={ styles.button }
                    contentStyle={ styles.buttonContent }
                    IconComponent={ hiddenItems.includes(item.value) ? EyeOff : Eye }
                    iconColor={ styles.buttonIcon.color }
                    iconProps={ { size: styles.buttonIcon.width, style: iconSizeStyle } }
                    onPress={ () => toggleItemVisibility(item.value) }
                  />
                  <ThemedButton
                    disabled={ index === 0 }
                    style={ styles.button }
                    contentStyle={ styles.buttonContent }
                    IconComponent={ ChevronUp }
                    iconColor={ styles.buttonIcon.color }
                    iconProps={ { size: styles.buttonIcon.width, style: iconSizeStyle } }
                    onPress={ () => moveItem(index, -1) }
                  />

                  <ThemedButton
                    disabled={ index === orderedItems.length - 1 }
                    style={ styles.button }
                    contentStyle={ styles.buttonContent }
                    IconComponent={ ChevronDown }
                    iconColor={ styles.buttonIcon.color }
                    iconProps={ { size: styles.buttonIcon.width, style: iconSizeStyle } }
                    onPress={ () => moveItem(index, 1) }
                  />
                </View>
              </View>
            );
          }) }
        </ThemedScrollView>
  );
  if (embedded) return list;

  return (
    <Page checkConnection={ false }>
      <ThemedSafeArea>
        <Header title={ title } disableBackRipple onBack={ onBack } />
        { list }
      </ThemedSafeArea>
    </Page>
  );
};

export default NavigationOrderSettingComponent;