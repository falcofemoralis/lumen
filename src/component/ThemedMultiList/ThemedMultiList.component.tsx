import { InfoBlock } from 'Component/InfoBlock';
import { ThemedPressable } from 'Component/ThemedPressable';
import { useLandscape } from 'Hooks/useLandscape';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { Square, SquareCheck } from 'lucide-react-native';
import { useCallback } from 'react';
import {
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './ThemedMultiList.style';
import { ListItem, ThemedMultiListComponentProps } from './ThemedMultiList.type';

export const ThemedMultiListComponent = ({
  values,
  header,
  noItemsTitle,
  noItemsSubtitle,
  handleOnChange,
}: ThemedMultiListComponentProps) => {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const isLandscape = useLandscape();

  const renderHeader = () => {
    if (!header) {
      return null;
    }

    return (
      <View style={ styles.listHeader }>
        <Text style={ styles.listHeaderText }>
          { header }
        </Text>
      </View>
    );
  };

  const renderItem = useCallback(({ item }: { item: ListItem }) => (
    <ThemedPressable
      key={ item.value }
      onPress={ () => handleOnChange(item.value, !item.isChecked) }
      style={ styles.listItem }
      contentStyle={ styles.listItemContent }
    >
      <View style={ styles.item }>
        <Text style={ styles.itemLabel }>
          { item.label }
        </Text>
        { item.isChecked ? (
          <SquareCheck
            color={ theme.colors.primary }
          />
        ) : (
          <Square
            color={ theme.colors.icon }
          />
        ) }
      </View>
    </ThemedPressable>
  ), [handleOnChange]);

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
      <ScrollView>
        { values.map((item) => renderItem({ item })) }
      </ScrollView>
    );
  };

  const renderContent = () => (
    <View
      style={ [
        styles.listItems,
        isLandscape && styles.listItemsLandscape,
      ] }
    >
      { renderItems() }
    </View>
  );

  return (
    <View style={ styles.listContainer }>
      { renderHeader() }
      { renderContent() }
    </View>
  );
};

export default ThemedMultiListComponent;
