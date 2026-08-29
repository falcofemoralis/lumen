import { InfoBlock } from 'Component/InfoBlock';
import { ThemedSimpleList } from 'Component/ThemedSimpleList';
import { ListItem as SimpleListItem } from 'Component/ThemedSimpleList/ThemedSimpleList.type';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Square from 'lucide-react-native/icons/square';
import SquareCheck from 'lucide-react-native/icons/square-check';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './ThemedMultiList.style.atv';
import { ThemedMultiListComponentProps } from './ThemedMultiList.type';

export const ThemedMultiListComponent = ({
  values,
  header,
  noItemsTitle,
  noItemsSubtitle,
  searchComponent,
  handleOnChange,
}: ThemedMultiListComponentProps) => {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  // The list items carry no checked state of their own, so it is resolved back
  // from `values` by value whenever an item renders or is pressed.
  const checkedByValue = useMemo(
    () => new Map(values.map(({ value, isChecked }) => [value, isChecked])),
    [values]
  );

  const renderCheckbox = useCallback((item: SimpleListItem, isFocused: boolean) => (
    <View style={ styles.checkbox }>
      { checkedByValue.get(item.value) ? (
        <SquareCheck
          color={ theme.colors.secondary }
          size={ scale(20) }
        />
      ) : (
        <Square
          color={ isFocused ? theme.colors.iconFocused : theme.colors.icon }
          size={ scale(20) }
        />
      ) }
    </View>
  ), [checkedByValue, styles, theme, scale]);

  const onChange = useCallback((item: SimpleListItem) => {
    handleOnChange(item.value, !checkedByValue.get(item.value));
  }, [handleOnChange, checkedByValue]);

  const emptyComponent = useMemo(() => (
    <InfoBlock
      title={ noItemsTitle ?? t('No items') }
      subtitle={ noItemsSubtitle ?? '' }
      hideIcon
      style={ styles.emptyBlock }
    />
  ), [noItemsTitle, noItemsSubtitle, styles]);

  return (
    <ThemedSimpleList
      data={ values }
      header={ header }
      onChange={ onChange }
      rightAdditionalElement={ renderCheckbox }
      emptyComponent={ emptyComponent }
      searchComponent={ searchComponent }
    />
  );
};

export default ThemedMultiListComponent;
