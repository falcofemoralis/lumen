import { InfoBlock } from 'Component/InfoBlock';
import { ThemedPressable } from 'Component/ThemedPressable';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { Square, SquareCheck } from 'lucide-react-native';
import { Text, View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationVirtualizedList,
} from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './ThemedMultiList.style.atv';
import { ListItem, ThemedMultiListComponentProps } from './ThemedMultiList.type';

export const ThemedMultiListComponent = ({
  values,
  header,
  noItemsTitle,
  noItemsSubtitle,
  handleOnChange,
}: ThemedMultiListComponentProps) => {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

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

  const renderItem = ({ item }: { item: ListItem }) => (
    <ThemedPressable
      onPress={ () => { handleOnChange(item.value, !item.isChecked); } }
    >
      { ({ isFocused }) => (
        <View style={ [
          styles.item,
          isFocused && styles.itemFocused,
        ] }
        >
          <View style={ styles.itemContainer }>
            <Text style={ [
              styles.text,
              isFocused && styles.textFocused,
            ] }
            >
              { item.label }
            </Text>
          </View>
          { item.isChecked ? (
            <SquareCheck
              color={ theme.colors.primary }
              size={ scale(20) }
            />
          ) : (
            <Square
              color={ isFocused ? theme.colors.iconFocused : theme.colors.icon }
              size={ scale(20) }
            />
          ) }
        </View>
      ) }
    </ThemedPressable>
  );

  const renderItems = () => {
    if (!values.length) {
      return (
        <InfoBlock
          title={ noItemsTitle ?? t('No items') }
          subtitle={ noItemsSubtitle ?? '' }
          hideIcon
          style={ styles.emptyBlock }
        />
      );
    }

    return (
      <DefaultFocus>
        <SpatialNavigationVirtualizedList
          data={ values }
          renderItem={ renderItem }
          itemSize={ styles.item.height }
          orientation="vertical"
        />
      </DefaultFocus>
    );
  };

  const renderContent = () => {
    return (
      <View
        style={ styles.scrollViewContainer }
      >
        { renderItems() }
      </View>
    );
  };

  return (
    <View style={ styles.listContainer }>
      <View style={ styles.contentContainer }>
        { renderHeader() }
        { renderContent() }
      </View>
    </View>
  );
};

export default ThemedMultiListComponent;
